import type { OrderRecord } from "@/lib/types/order";

// =====================================================================
// Métricas del panel, como funciones puras sobre los pedidos.
// Todo se calcula en hora de Argentina (los "días" del negocio), sin
// depender de la zona horaria del servidor (Vercel corre en UTC).
// Solo se importan tipos: el módulo se puede testear con Node directo.
// =====================================================================

export const TZ = "America/Argentina/Buenos_Aires";
const DAY_MS = 86_400_000;

type Status = "nuevo" | "confirmado" | "entregado" | "cancelado";

function status(o: OrderRecord): Status {
  return (["nuevo", "confirmado", "entregado", "cancelado"] as string[]).includes(o.status)
    ? (o.status as Status)
    : "nuevo";
}
const isActive = (o: OrderRecord) => status(o) !== "cancelado";
const isPending = (o: OrderRecord) => status(o) === "nuevo" || status(o) === "confirmado";
const baseId = (menuItemId: string) => menuItemId.split("__")[0] ?? menuItemId;

/** "YYYY-MM-DD" del instante dado, en hora de Argentina. */
export function dayKey(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-CA", { timeZone: TZ });
}

/** Suma días a una clave "YYYY-MM-DD" (aritmética de calendario, sin husos). */
export function addDays(key: string, days: number): string {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Diferencia en días entre dos claves "YYYY-MM-DD" (b - a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / DAY_MS);
}

/** Variación porcentual; null si no hay base para comparar. */
export function pctChange(current: number, previous: number): number | null {
  if (previous <= 0) return current > 0 ? null : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function orderCost(o: OrderRecord, costMap: Record<string, number>): number {
  return o.items.reduce((s, it) => s + (costMap[baseId(it.menuItemId)] ?? 0) * it.quantity, 0);
}

// ---------------------------------------------------------------------
// Resumen general
// ---------------------------------------------------------------------

export interface PeriodStats {
  revenue: number;
  orders: number;
  avgTicket: number;
  profit: number;
}

export interface Alert {
  id: string;
  tone: "danger" | "warning" | "info";
  title: string;
  detail: string;
  href: string;
}

export interface Overview {
  today: string;
  /** Mes en curso (día 1 → hoy) vs. el mismo tramo del mes anterior. */
  mtd: PeriodStats;
  prevMtd: PeriodStats;
  hasCosts: boolean;
  marginPct: number | null;
  /** Facturación de pedidos activos con entrega de hoy en adelante. */
  committed: { revenue: number; orders: number };
  /** Últimos 90 días. */
  cancelRate: number;
  repeatRate: number;
  avgLeadDays: number | null;
  /** Serie diaria de los últimos 30 días + los 30 anteriores (para comparar). */
  daily: { day: string; revenue: number; orders: number; prevRevenue: number }[];
  payments: { method: string; revenue: number; orders: number }[];
  topProducts: { name: string; qty: number; revenue: number }[];
  upcoming: OrderRecord[];
  recent: OrderRecord[];
  alerts: Alert[];
}

function periodStats(orders: OrderRecord[], costMap: Record<string, number>): PeriodStats {
  const revenue = orders.reduce((s, o) => s + o.total_in_cents, 0);
  const cost = orders.reduce((s, o) => s + orderCost(o, costMap), 0);
  return {
    revenue,
    orders: orders.length,
    avgTicket: orders.length ? Math.round(revenue / orders.length) : 0,
    profit: revenue - cost,
  };
}

export function computeOverview(
  all: OrderRecord[],
  costMap: Record<string, number>,
  now: Date = new Date()
): Overview {
  const today = dayKey(now);
  const active = all.filter(isActive);
  const created = new Map(all.map((o) => [o.id, dayKey(o.created_at)]));
  const createdOf = (o: OrderRecord) => created.get(o.id) as string;

  // --- Mes en curso vs. mismo tramo del mes anterior ---
  const [y, m, d] = today.split("-").map(Number) as [number, number, number];
  const monthStart = `${today.slice(0, 7)}-01`;
  const prevY = m === 1 ? y - 1 : y;
  const prevM = m === 1 ? 12 : m - 1;
  const prevMonthDays = new Date(Date.UTC(prevY, prevM, 0)).getUTCDate();
  const prevStart = `${prevY}-${String(prevM).padStart(2, "0")}-01`;
  const prevEnd = `${prevY}-${String(prevM).padStart(2, "0")}-${String(Math.min(d, prevMonthDays)).padStart(2, "0")}`;

  const mtdOrders = active.filter((o) => createdOf(o) >= monthStart && createdOf(o) <= today);
  const prevOrders = active.filter((o) => createdOf(o) >= prevStart && createdOf(o) <= prevEnd);
  const mtd = periodStats(mtdOrders, costMap);
  const prevMtd = periodStats(prevOrders, costMap);
  const hasCosts = Object.keys(costMap).length > 0;

  // --- Comprometido a futuro (caja que ya está vendida) ---
  const future = active.filter((o) => isPending(o) && o.delivery_date && o.delivery_date >= today);
  const committed = {
    revenue: future.reduce((s, o) => s + o.total_in_cents, 0),
    orders: future.length,
  };

  // --- Ventana de 90 días: cancelación, recurrencia y anticipación ---
  const from90 = addDays(today, -89);
  const last90 = all.filter((o) => createdOf(o) >= from90);
  const cancelled90 = last90.filter((o) => status(o) === "cancelado").length;
  const cancelRate = last90.length ? Math.round((cancelled90 / last90.length) * 1000) / 10 : 0;

  const perCustomer = new Map<string, number>();
  for (const o of active) {
    const key = o.customer_phone.replace(/\D/g, "") || o.customer_name.toLowerCase();
    perCustomer.set(key, (perCustomer.get(key) ?? 0) + 1);
  }
  const repeat = [...perCustomer.values()].filter((n) => n >= 2).length;
  const repeatRate = perCustomer.size ? Math.round((repeat / perCustomer.size) * 1000) / 10 : 0;

  const leads = last90
    .filter((o) => isActive(o) && o.delivery_date)
    .map((o) => daysBetween(createdOf(o), o.delivery_date as string))
    .filter((n) => n >= 0);
  const avgLeadDays = leads.length
    ? Math.round((leads.reduce((s, n) => s + n, 0) / leads.length) * 10) / 10
    : null;

  // --- Serie diaria (30 días) + período anterior ---
  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (const o of active) {
    const k = createdOf(o);
    const cur = byDay.get(k) ?? { revenue: 0, orders: 0 };
    cur.revenue += o.total_in_cents;
    cur.orders += 1;
    byDay.set(k, cur);
  }
  const daily = Array.from({ length: 30 }, (_, i) => {
    const day = addDays(today, i - 29);
    const prev = addDays(day, -30);
    return {
      day,
      revenue: byDay.get(day)?.revenue ?? 0,
      orders: byDay.get(day)?.orders ?? 0,
      prevRevenue: byDay.get(prev)?.revenue ?? 0,
    };
  });

  // --- Medios de pago (90 días) ---
  const pay = new Map<string, { revenue: number; orders: number }>();
  for (const o of last90.filter(isActive)) {
    const cur = pay.get(o.payment_method) ?? { revenue: 0, orders: 0 };
    cur.revenue += o.total_in_cents;
    cur.orders += 1;
    pay.set(o.payment_method, cur);
  }
  const payments = [...pay.entries()]
    .map(([method, v]) => ({ method, ...v }))
    .sort((a, b) => b.revenue - a.revenue);

  // --- Productos top del mes ---
  const prod = new Map<string, { qty: number; revenue: number }>();
  for (const o of mtdOrders) {
    for (const it of o.items) {
      const cur = prod.get(it.name) ?? { qty: 0, revenue: 0 };
      cur.qty += it.quantity;
      cur.revenue += it.priceInCents * it.quantity;
      prod.set(it.name, cur);
    }
  }
  const topProducts = [...prod.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // --- Próximas entregas (7 días) y actividad reciente ---
  const in7 = addDays(today, 7);
  const upcoming = future
    .filter((o) => (o.delivery_date as string) <= in7)
    .sort((a, b) => (a.delivery_date as string).localeCompare(b.delivery_date as string));
  const recent = [...all]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 6);

  return {
    today,
    mtd,
    prevMtd,
    hasCosts,
    marginPct: hasCosts && mtd.revenue > 0 ? Math.round((mtd.profit / mtd.revenue) * 1000) / 10 : null,
    committed,
    cancelRate,
    repeatRate,
    avgLeadDays,
    daily,
    payments,
    topProducts,
    upcoming,
    recent,
    alerts: computeAlerts(all, costMap, now),
  };
}

// ---------------------------------------------------------------------
// Alertas: lo que el dueño tiene que resolver hoy
// ---------------------------------------------------------------------

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function computeAlerts(
  all: OrderRecord[],
  costMap: Record<string, number>,
  now: Date = new Date()
): Alert[] {
  const today = dayKey(now);
  const tomorrow = addDays(today, 1);
  const alerts: Alert[] = [];

  const overdue = all.filter((o) => isPending(o) && o.delivery_date && o.delivery_date < today);
  if (overdue.length)
    alerts.push({
      id: "overdue",
      tone: "danger",
      title: `${plural(overdue.length, "entrega vencida", "entregas vencidas")} sin cerrar`,
      detail: "La fecha ya pasó y siguen pendientes. Marcalas como entregadas o canceladas para que las métricas sean reales.",
      href: "/admin/pedidos?estado=confirmado",
    });

  const urgent = all.filter(
    (o) => status(o) === "nuevo" && o.delivery_date && o.delivery_date >= today && o.delivery_date <= tomorrow
  );
  if (urgent.length)
    alerts.push({
      id: "urgent",
      tone: "danger",
      title: `${plural(urgent.length, "pedido", "pedidos")} para hoy o mañana sin confirmar`,
      detail: "Confirmá con el cliente cuanto antes: la entrega está encima.",
      href: "/admin/pedidos?estado=nuevo",
    });

  const stale = all.filter(
    (o) => status(o) === "nuevo" && now.getTime() - Date.parse(o.created_at) > 12 * 3_600_000
  );
  const staleNotUrgent = stale.filter((o) => !urgent.includes(o));
  if (staleNotUrgent.length)
    alerts.push({
      id: "stale",
      tone: "warning",
      title: `${plural(staleNotUrgent.length, "pedido", "pedidos")} sin respuesta hace más de 12 h`,
      detail: "Un cliente que espera mucho la confirmación suele irse a otro catering.",
      href: "/admin/pedidos?estado=nuevo",
    });

  const noDate = all.filter((o) => isPending(o) && !o.delivery_date);
  if (noDate.length)
    alerts.push({
      id: "nodate",
      tone: "warning",
      title: `${plural(noDate.length, "pedido activo", "pedidos activos")} sin fecha de entrega`,
      detail: "No aparecen en la agenda ni en producción. Coordiná la fecha con el cliente.",
      href: "/admin/pedidos",
    });

  const soldIds = new Set(all.filter(isActive).flatMap((o) => o.items.map((it) => baseId(it.menuItemId))));
  const missingCost = [...soldIds].filter((id) => !costMap[id]).length;
  if (missingCost)
    alerts.push({
      id: "cost",
      tone: "info",
      title: `${plural(missingCost, "producto vendido", "productos vendidos")} sin costo cargado`,
      detail: "Sin el costo no se puede calcular la ganancia real de esos productos.",
      href: "/admin/menu",
    });

  return alerts;
}

// ---------------------------------------------------------------------
// Producción: qué cocinar y cuánto, por día de entrega
// ---------------------------------------------------------------------

export interface ProductionLine {
  name: string;
  unit?: string;
  confirmed: number;
  pending: number;
  orders: { id: string; customer: string; qty: number; status: Status }[];
}

export interface ProductionDay {
  day: string;
  orders: number;
  revenue: number;
  lines: ProductionLine[];
}

export function computeProduction(all: OrderRecord[], fromDay: string, toDay: string): ProductionDay[] {
  const days = new Map<string, { orders: Set<string>; revenue: number; lines: Map<string, ProductionLine> }>();

  for (const o of all) {
    if (!isPending(o) || !o.delivery_date) continue;
    if (o.delivery_date < fromDay || o.delivery_date > toDay) continue;
    const day = days.get(o.delivery_date) ?? { orders: new Set(), revenue: 0, lines: new Map() };
    if (!day.orders.has(o.id)) {
      day.orders.add(o.id);
      day.revenue += o.total_in_cents;
    }
    for (const it of o.items) {
      const line = day.lines.get(it.name) ?? { name: it.name, unit: it.unit, confirmed: 0, pending: 0, orders: [] };
      if (status(o) === "confirmado") line.confirmed += it.quantity;
      else line.pending += it.quantity;
      line.orders.push({ id: o.id, customer: o.customer_name, qty: it.quantity, status: status(o) });
      day.lines.set(it.name, line);
    }
    days.set(o.delivery_date, day);
  }

  return [...days.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, v]) => ({
      day,
      orders: v.orders.size,
      revenue: v.revenue,
      lines: [...v.lines.values()].sort((a, b) => b.confirmed + b.pending - (a.confirmed + a.pending)),
    }));
}

// ---------------------------------------------------------------------
// Contadores para el menú lateral
// ---------------------------------------------------------------------

export function computeNavCounts(all: OrderRecord[], now: Date = new Date()) {
  const today = dayKey(now);
  const tomorrow = addDays(today, 1);
  return {
    newOrders: all.filter((o) => status(o) === "nuevo").length,
    deliveriesSoon: all.filter(
      (o) => isPending(o) && o.delivery_date && o.delivery_date >= today && o.delivery_date <= tomorrow
    ).length,
    alerts: computeAlerts(all, {}, now).filter((a) => a.tone === "danger").length,
  };
}
