import type { ReactNode } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OrderRecord } from "@/lib/types/order";
import { formatPrice } from "@/lib/utils";
import { isActive } from "@/lib/admin/orders";
import { TrendingUp, Trophy, Tags, CalendarRange } from "lucide-react";

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
    supabase.from("menu_items").select("id, category"),
  ]);

  const orders = ((ordersData ?? []) as OrderRecord[]).filter(isActive);
  const catOf = new Map<string, string>(
    ((menuData ?? []) as { id: string; category: string }[]).map((m) => [m.id, m.category])
  );

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

  // --- Top platos por facturación ---
  const itemAgg = new Map<string, { qty: number; revenue: number }>();
  const catRevenue = new Map<string, number>();
  for (const o of orders) {
    for (const it of o.items) {
      const cur = itemAgg.get(it.name) ?? { qty: 0, revenue: 0 };
      cur.qty += it.quantity;
      cur.revenue += it.priceInCents * it.quantity;
      itemAgg.set(it.name, cur);
      const cat = catOf.get(it.menuItemId) ?? "Otros";
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

  // --- Pedidos por día de semana ---
  const weekdayCount = new Array(7).fill(0);
  for (const o of orders) {
    const js = new Date(o.created_at).getDay(); // 0=domingo
    const idx = js === 0 ? 6 : js - 1; // lunes primero
    weekdayCount[idx]++;
  }
  const byWeekday = WEEKDAYS.map((label, i) => ({ label, value: weekdayCount[i] }));

  const totalRevenue = orders.reduce((s, o) => s + o.total_in_cents, 0);

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
      )}
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
