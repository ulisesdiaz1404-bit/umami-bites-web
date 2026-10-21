import type { OrderRecord, OrderItemSnapshot } from "@/lib/types/order";
import type { PaymentMethod } from "@/lib/whatsapp-order";
import { MENU_ITEMS } from "@/lib/data/mock-menu";

// =====================================================================
// Datos de EJEMPLO para ver el panel en local sin Supabase.
// Solo se usan si ADMIN_DEMO=1 y Supabase NO está configurado (ver
// lib/admin/data.ts), así que nunca aparecen en producción.
// Generador determinístico: mismos datos en cada carga del mismo día.
// =====================================================================

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CUSTOMERS = [
  ["Martina Gómez", "11 5934-2210"], ["Joaquín Pereyra", "11 6120-8841"], ["Lucía Fernández", "11 4471-0932"],
  ["Tomás Ríos", "11 5582-1176"], ["Valentina Sosa", "11 3309-6620"], ["Federico Álvarez", "11 6845-2093"],
  ["Camila Herrera", "11 5011-7734"], ["Nicolás Medina", "11 4290-5518"], ["Agustina Romero", "11 6612-4407"],
  ["Santiago Castro", "11 5760-3381"], ["Florencia Díaz", "11 3825-9910"], ["Matías Acosta", "11 4958-0624"],
  ["Sofía Benítez", "11 6203-7745"], ["Ignacio Suárez", "11 5147-2289"], ["Paula Molina", "11 4632-8851"],
  ["Estudio Lanús & Asoc.", "11 4019-3360"], ["Rocío Navarro", "11 6378-1142"], ["Gonzalo Ortiz", "11 5420-9967"],
  ["Carolina Luna", "11 3718-4425"], ["Bruno Giménez", "11 6091-5536"], ["Julieta Cabrera", "11 4805-2271"],
  ["Hernán Vega", "11 5263-8810"], ["Micaela Ruiz", "11 6544-0398"], ["Agencia Brote", "11 4127-6654"],
] as const;

const ADDRESSES = [
  "Av. Libertador 2240, Vicente López", "Belgrano 1450, San Isidro", "Las Heras 890, Tigre",
  "Panamericana km 49, Pilar", "Av. Rivadavia 6120, CABA", "Moreno 344, Morón",
  "Gorriti 5021, Palermo, CABA", "Sarmiento 1180, San Miguel", "Av. del Golf 77, Bella Vista",
];

const PAYMENTS: PaymentMethod[] = ["mp", "mp", "efectivo", "tarjeta", "mp", "efectivo"];

function pick<T>(r: () => number, arr: readonly T[]): T {
  return arr[Math.floor(r() * arr.length)] as T;
}

export function demoOrders(now: Date = new Date()): OrderRecord[] {
  const r = rng(20261020);
  const items = MENU_ITEMS.filter((m) => m.priceInCents > 0);
  const orders: OrderRecord[] = [];
  // Clientes frecuentes: los primeros 8 aparecen más seguido.
  const customerOf = () => (r() < 0.45 ? CUSTOMERS[Math.floor(r() * 8)] : pick(r, CUSTOMERS))!;

  for (let i = 0; i < 55; i++) {
    // Más pedidos recientes (el negocio crece) y picos de jueves/viernes.
    const daysAgo = Math.floor(Math.pow(r(), 1.35) * 130) - 4;
    const created = new Date(now.getTime() - daysAgo * 86_400_000 - Math.floor(r() * 10) * 3_600_000);
    const lead = 2 + Math.floor(r() * 12);
    const delivery = new Date(created.getTime() + lead * 86_400_000);
    if (created > now) continue;

    const lines: OrderItemSnapshot[] = [];
    const n = 1 + Math.floor(r() * 3);
    for (let k = 0; k < n; k++) {
      const m = pick(r, items);
      if (lines.some((l) => l.menuItemId === m.id)) continue;
      const qty = m.type === "package" ? 1 : 1 + Math.floor(r() * 4);
      lines.push({ menuItemId: m.id, name: m.name, quantity: qty, unit: m.metadata?.unit, priceInCents: m.priceInCents });
    }
    const subtotal = lines.reduce((s, l) => s + l.priceInCents * l.quantity, 0);
    const shipping = r() < 0.25 ? 0 : 500_000 + Math.floor(r() * 4) * 250_000;
    const [name, phone] = customerOf();

    const deliveryDay = delivery.toISOString().slice(0, 10);
    const past = delivery.getTime() < now.getTime() - 86_400_000;
    let status: OrderRecord["status"];
    if (r() < 0.07) status = "cancelado";
    else if (past) status = r() < 0.04 ? "confirmado" : "entregado"; // algunas vencidas sin cerrar
    else status = r() < 0.55 ? "confirmado" : "nuevo";

    orders.push({
      id: `demo-${i}`,
      created_at: created.toISOString(),
      customer_name: name,
      customer_phone: phone,
      address: pick(r, ADDRESSES),
      notes: r() < 0.2 ? "Tocar timbre 2B. Evento para 25 personas." : null,
      delivery_date: r() < 0.04 && !past ? null : deliveryDay,
      payment_method: pick(r, PAYMENTS),
      items: lines,
      subtotal_in_cents: subtotal,
      shipping_in_cents: shipping,
      total_in_cents: subtotal + shipping,
      status,
    });
  }
  return orders.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/** Costos de ejemplo (~40–55 % del precio) para la mayoría de los productos. */
export function demoCostMap(): Record<string, number> {
  const r = rng(7);
  const map: Record<string, number> = {};
  for (const m of MENU_ITEMS) {
    if (m.priceInCents > 0 && r() < 0.8) map[m.id] = Math.round(m.priceInCents * (0.4 + r() * 0.15));
  }
  return map;
}

export function demoCategoryMap(): Record<string, string> {
  return Object.fromEntries(MENU_ITEMS.map((m) => [m.id, m.category]));
}
