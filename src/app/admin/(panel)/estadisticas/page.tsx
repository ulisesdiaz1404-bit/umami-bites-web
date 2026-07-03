import type { ReactNode } from "react";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OrderRecord } from "@/lib/types/order";
import { formatPrice } from "@/lib/utils";
import { isActive, baseMenuItemId } from "@/lib/admin/orders";
import {
  TrendingUp,
  Trophy,
  Tags,
  CalendarRange,
  Wallet,
  Coins,
  Percent,
  PiggyBank,
  Info,
} from "lucide-react";

export const dynamic = "force-dynamic";

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default async function EstadisticasPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8">
        <h1 className="font-display text-2xl text-cream">Estadísticas</h1>
        <p className="mt-3 text-sm text-muted">Conectá Supabase para ver las estadísticas.</p>
      </div>
    );
  }

  const [{ data: ordersData }, { data: menuData }] = await Promise.all([
    supabase.from("orders").select("*"),
    supabase.from("menu_items").select("id, category, metadata"),
  ]);

  const orders = ((ordersData ?? []) as OrderRecord[]).filter(isActive);
  const menuRows = (menuData ?? []) as {
    id: string;
    category: string;
    metadata: Record<string, string> | null;
  }[];
  const catOf = new Map<string, string>(menuRows.map((m) => [m.id, m.category]));
  const costOf = new Map<string, number>(
    menuRows
      .map((m) => [m.id, Number(m.metadata?.cost ?? 0)] as const)
      .filter(([, c]) => c > 0)
  );
  const hasCosts = costOf.size > 0;

  // --- Facturación por mes (últimos 6) ---
  const now = new Date();
  const monthKeys: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthKeys.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTHS[d.getMonth()] ?? "" });
  }
  const monthRevenue = new Map<string, number>();
  for (const o of orders) {
    const d = new Date(o.created_at);
    const k = `${d.getFullYear()}-${d.getMonth()}`;
    monthRevenue.set(k, (monthRevenue.get(k) ?? 0) + o.total_in_cents);
  }
  const byMonth = monthKeys.map((m) => ({ label: m.label, value: monthRevenue.get(m.key) ?? 0 }));

  // --- Top platos por facturación + ganancia por producto ---
  const itemAgg = new Map<string, { qty: number; revenue: number; cost: number; hasCost: boolean }>();
  const catRevenue = new Map<string, number>();
  for (const o of orders) {
    for (const it of o.items) {
      const baseId = baseMenuItemId(it.menuItemId);
      const unitCost = costOf.get(baseId) ?? 0;
      const cur = itemAgg.get(it.name) ?? { qty: 0, revenue: 0, cost: 0, hasCost: false };
      cur.qty += it.quantity;
      cur.revenue += it.priceInCents * it.quantity;
      cur.cost += unitCost * it.quantity;
      if (costOf.has(baseId)) cur.hasCost = true;
      itemAgg.set(it.name, cur);
      const cat = catOf.get(baseId) ?? "Otros";
      catRevenue.set(cat, (catRevenue.get(cat) ?? 0) + it.priceInCents * it.quantity);
    }
  }
  const topItems = [...itemAgg.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);
  const byCategory = [...catRevenue.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  // Ganancia por producto: solo tiene sentido para ítems con costo cargado.
  const profitItems = [...itemAgg.entries()]
    .filter(([, v]) => v.hasCost)
    .map(([name, v]) => ({
      name,
      qty: v.qty,
      revenue: v.revenue,
      cost: v.cost,
      profit: v.revenue - v.cost,
      margin: v.revenue > 0 ? Math.round(((v.revenue - v.cost) / v.revenue) * 100) : 0,
    }))
    .sort((a, b) => b.profit - a.profit);

  const totalCost = [...itemAgg.values()].reduce((s, v) => s + v.cost, 0);

  // --- Pedidos por día de semana ---
  const weekdayCount = new Array(7).fill(0);
  for (const o of orders) {
    const js = new Date(o.created_at).getDay(); // 0=domingo
    const idx = js === 0 ? 6 : js - 1; // lunes primero
    weekdayCount[idx]++;
  }
  const byWeekday = WEEKDAYS.map((label, i) => ({ label, value: weekdayCount[i] }));

  const totalRevenue = orders.reduce((s, o) => s + o.total_in_cents, 0);
  const totalProfit = totalRevenue - totalCost;
  const avgMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-cream">Estadísticas</h1>
        <p className="mt-1 text-sm text-muted">
          Basado en {orders.length} pedidos activos · {formatPrice(totalRevenue, "ARS")} facturados.
        </p>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface p-10 text-center text-sm text-muted">
          Todavía no hay datos suficientes. Cuando entren pedidos, acá aparecen las métricas.
        </p>
      ) : (
        <>
          {/* ------------------- Resumen de rentabilidad ------------------- */}
          <section>
            <h2 className="mb-1 font-display text-xl text-cream">Resumen de rentabilidad</h2>
            <p className="mb-4 text-sm text-muted">
              De todo lo facturado, cuánto es costo de mercadería y cuánto queda de ganancia real.
            </p>

            {!hasCosts ? (
              <div className="flex items-start gap-3 rounded-2xl border border-[#e8d3ac] bg-[#f7edda] p-5 text-sm text-[#8a5a1e]">
                <Info className="mt-0.5 size-5 shrink-0" />
                <p>
                  Todavía no cargaste el <strong>costo</strong> de ningún producto, así que no se puede
                  calcular la ganancia real (solo la facturación). Andá a{" "}
                  <Link href="/admin/menu" className="font-semibold underline">
                    Menú
                  </Link>{" "}
                  → editá un plato → completá el campo &quot;Costo (ARS)&quot; y guardá. En cuanto
                  cargues costos, acá aparece el desglose.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Kpi
                  icon={Wallet}
                  label="Facturación total"
                  value={formatPrice(totalRevenue, "ARS")}
                  caption="Todo lo que pagaron los clientes"
                  accent="#2563eb"
                  tint="#e9effc"
                />
                <Kpi
                  icon={Coins}
                  label="Costo de mercadería"
                  value={formatPrice(totalCost, "ARS")}
                  caption="Lo que te costó producir/comprar"
                  accent="#a83422"
                  tint="#f8e7e3"
                />
                <Kpi
                  icon={PiggyBank}
                  label="Ganancia real"
                  value={formatPrice(totalProfit, "ARS")}
                  caption="Facturación menos costo"
                  accent="#2f8f4e"
                  tint="#e6f1e8"
                />
                <Kpi
                  icon={Percent}
                  label="Margen promedio"
                  value={`${avgMargin}%`}
                  caption="Ganancia sobre lo facturado"
                  accent="#7c3aed"
                  tint="#efe9fb"
                />
              </div>
            )}
          </section>

          {/* ------------------- Ganancia por producto ------------------- */}
          {hasCosts && (
            <section className="rounded-2xl border border-line bg-surface p-6 shadow-card">
              <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-cream">
                <span
                  className="flex size-7 items-center justify-center rounded-lg"
                  style={{ background: "#2f8f4e1a", color: "#2f8f4e" }}
                >
                  <PiggyBank className="size-4" />
                </span>
                Ganancia por producto
              </h2>
              <p className="mb-4 ml-9 text-xs text-muted">
                Solo productos con costo cargado. Ordenado de mayor a menor ganancia.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                      <th className="py-2 pr-3 font-medium">Producto</th>
                      <th className="px-3 py-2 text-right font-medium">Vendidos</th>
                      <th className="px-3 py-2 text-right font-medium">Facturación</th>
                      <th className="px-3 py-2 text-right font-medium">Costo</th>
                      <th className="px-3 py-2 text-right font-medium">Ganancia</th>
                      <th className="py-2 pl-3 text-right font-medium">Margen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitItems.map((p) => (
                      <tr key={p.name} className="border-b border-line/60 last:border-0">
                        <td className="max-w-[220px] truncate py-2.5 pr-3 text-primary/90" title={p.name}>
                          {p.name}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-muted">{p.qty}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-primary/90">
                          {formatPrice(p.revenue, "ARS")}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-[#a83422]">
                          {formatPrice(p.cost, "ARS")}
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-[#2f6b3f]">
                          {formatPrice(p.profit, "ARS")}
                        </td>
                        <td className="py-2.5 pl-3 text-right tabular-nums text-muted">{p.margin}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {itemAgg.size > profitItems.length && (
                <p className="mt-4 text-xs text-muted">
                  {itemAgg.size - profitItems.length} producto(s) vendido(s) más sin costo cargado
                  todavía — no aparecen en esta tabla.
                </p>
              )}
            </section>
          )}

          {/* ------------------- Gráficos generales ------------------- */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel icon={TrendingUp} title="Facturación por mes" accent="#2563eb">
              <BarChart data={byMonth} format={(v) => formatPrice(v, "ARS")} color="#2563eb" />
            </Panel>

            <Panel icon={CalendarRange} title="Pedidos por día de semana" accent="#7c3aed">
              <BarChart data={byWeekday} format={(v) => String(v)} color="#7c3aed" />
            </Panel>

            <Panel icon={Trophy} title="Platos más vendidos (facturación)" accent="#c9871f">
              <BarChart
                data={topItems.map((i) => ({ label: i.name, value: i.revenue, hint: `${i.qty}u` }))}
                format={(v) => formatPrice(v, "ARS")}
                color="#c9871f"
                horizontal
              />
            </Panel>

            <Panel icon={Tags} title="Facturación por categoría" accent="#2f8f4e">
              <BarChart
                data={byCategory}
                format={(v) => formatPrice(v, "ARS")}
                color="#2f8f4e"
                horizontal
              />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  caption,
  accent,
  tint,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  caption: string;
  accent: string;
  tint: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <div
        className="flex size-10 items-center justify-center rounded-xl"
        style={{ background: tint, color: accent }}
      >
        <Icon className="size-5" />
      </div>
      <p className="mt-4 text-2xl font-semibold tabular-nums text-cream">{value}</p>
      <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-primary/80">{label}</p>
      <p className="mt-1 text-xs leading-snug text-muted">{caption}</p>
    </div>
  );
}

function Panel({
  icon: Icon,
  title,
  accent,
  children,
}: {
  icon: typeof TrendingUp;
  title: string;
  accent: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-card">
      <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold text-cream">
        <span
          className="flex size-7 items-center justify-center rounded-lg"
          style={{ background: `${accent}1a`, color: accent }}
        >
          <Icon className="size-4" />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function BarChart({
  data,
  format,
  color,
  horizontal = false,
}: {
  data: { label: string; value: number; hint?: string }[];
  format: (v: number) => string;
  color: string;
  horizontal?: boolean;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  if (horizontal) {
    return (
      <div className="space-y-2.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-xs text-primary/90" title={d.label}>
              {d.label}
            </span>
            <div className="h-5 flex-1 overflow-hidden rounded-full bg-bg-deep">
              <div
                className="h-full rounded-full"
                style={{ width: `${(d.value / max) * 100}%`, background: color, minWidth: d.value > 0 ? 6 : 0 }}
              />
            </div>
            <span className="w-24 shrink-0 text-right text-xs font-medium tabular-nums text-muted">
              {format(d.value)}
              {d.hint && <span className="ml-1 text-[10px] opacity-70">{d.hint}</span>}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Vertical
  return (
    <div className="flex h-44 items-end justify-between gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="text-[10px] font-medium tabular-nums text-muted">
            {d.value > 0 ? format(d.value) : ""}
          </span>
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-md transition-all"
              style={{ height: `${(d.value / max) * 100}%`, background: color, minHeight: d.value > 0 ? 4 : 0 }}
            />
          </div>
          <span className="text-xs text-primary/80">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
