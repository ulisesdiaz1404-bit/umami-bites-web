import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OrderRecord } from "@/lib/types/order";
import { formatPrice, formatUnit } from "@/lib/utils";
import { STATUS_META, statusOf, waHref, isActive } from "@/lib/admin/orders";
import { CalendarDays, Phone, ChefHat } from "lucide-react";

export const dynamic = "force-dynamic";

function todayStr(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
}

function dayLabel(date: string): { title: string; sub: string } {
  const today = todayStr();
  const t = new Date(`${today}T00:00:00`);
  const tomorrow = new Date(t);
  tomorrow.setDate(t.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString("en-CA");
  const pretty = new Date(`${date}T00:00:00`).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  if (date === today) return { title: "Hoy", sub: pretty };
  if (date === tomorrowStr) return { title: "Mañana", sub: pretty };
  return { title: pretty, sub: "" };
}

export default async function AgendaPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8">
        <h1 className="font-display text-2xl text-cream">Agenda de entregas</h1>
        <p className="mt-3 text-sm text-muted">Conectá Supabase para ver la agenda.</p>
      </div>
    );
  }

  const { data } = await supabase
    .from("orders")
    .select("*")
    .not("delivery_date", "is", null)
    .order("delivery_date", { ascending: true });

  const today = todayStr();
  const orders = ((data ?? []) as OrderRecord[]).filter(
    (o) => isActive(o) && o.delivery_date && o.delivery_date >= today
  );

  // Agrupar por fecha de entrega.
  const byDay = new Map<string, OrderRecord[]>();
  for (const o of orders) {
    const key = o.delivery_date as string;
    byDay.set(key, [...(byDay.get(key) ?? []), o]);
  }
  const days = [...byDay.entries()];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-cream">Agenda de entregas</h1>
        <p className="mt-1 text-sm text-muted">
          Qué preparar y cuándo. Solo pedidos activos con fecha de entrega, de hoy en adelante.
        </p>
      </div>

      {days.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface p-10 text-center text-sm text-muted">
          No hay entregas próximas con fecha asignada.
        </p>
      ) : (
        <div className="space-y-8">
          {days.map(([date, dayOrders]) => {
            const { title, sub } = dayLabel(date);
            const isToday = date === today;
            // Total a preparar por ítem (sumando cantidades del día).
            const prep = new Map<string, number>();
            for (const o of dayOrders) {
              for (const it of o.items) {
                prep.set(it.name, (prep.get(it.name) ?? 0) + it.quantity);
              }
            }
            const dayTotal = dayOrders.reduce((s, o) => s + o.total_in_cents, 0);

            return (
              <section key={date}>
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex size-11 flex-col items-center justify-center rounded-xl text-white"
                    style={{ background: isToday ? "#2f8f4e" : "#b07a3c" }}
                  >
                    <CalendarDays className="size-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl capitalize text-cream">{title}</h2>
                    {sub && <p className="text-xs capitalize text-muted">{sub}</p>}
                  </div>
                  <span className="ml-auto text-sm font-medium text-accent">
                    {dayOrders.length} {dayOrders.length === 1 ? "pedido" : "pedidos"} ·{" "}
                    {formatPrice(dayTotal, "ARS")}
                  </span>
                </div>

                {/* Resumen de cocina */}
                <div className="mb-3 rounded-xl border border-[#e8d3ac] bg-[#f7edda] p-4">
                  <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#8a5a1e]">
                    <ChefHat className="size-4" /> Para preparar
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[...prep.entries()].map(([name, qty]) => (
                      <span
                        key={name}
                        className="rounded-full bg-white px-3 py-1 text-xs font-medium text-primary shadow-sm"
                      >
                        <span className="text-accent">{qty}×</span> {name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pedidos del día */}
                <div className="space-y-2">
                  {dayOrders.map((o) => {
                    const meta = STATUS_META[statusOf(o.status)];
                    return (
                      <div
                        key={o.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-cream">{o.customer_name}</span>
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              style={{ background: meta.bg, color: meta.fg }}
                            >
                              {meta.label}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-muted">
                            {o.items.map((it) => `${it.quantity} ${it.name}`).join(" · ")}
                          </p>
                          <p className="text-xs text-muted">{o.address}</p>
                        </div>
                        <a
                          href={waHref(o.customer_phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#2f8f4e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#277a43]"
                        >
                          <Phone className="size-3.5" /> WhatsApp
                        </a>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
