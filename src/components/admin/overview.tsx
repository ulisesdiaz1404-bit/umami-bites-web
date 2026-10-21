"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Wallet,
  ShoppingBag,
  Receipt,
  PiggyBank,
  CalendarClock,
  Repeat,
  Ban,
  Hourglass,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ChevronRight,
  Truck,
  CreditCard,
  Trophy,
  Activity,
  TrendingUp,
  ChefHat,
  type LucideIcon,
} from "lucide-react";
import type { Overview } from "@/lib/admin/analytics";
import { pctChange, addDays } from "@/lib/admin/analytics";
import { STATUS_META, statusOf } from "@/lib/admin/orders";
import { PAYMENT_LABELS } from "@/lib/whatsapp-order";
import { cn, formatPrice } from "@/lib/utils";
import {
  AreaChart,
  BarList,
  EmptyState,
  PageHeader,
  Panel,
  PanelLink,
  StatCard,
  Stagger,
  rise,
} from "@/components/admin/kit";

const ALERT_TONE: Record<string, { icon: LucideIcon; cls: string }> = {
  danger: { icon: AlertTriangle, cls: "bg-danger/12 text-danger" },
  warning: { icon: AlertCircle, cls: "bg-accent/15 text-accent" },
  info: { icon: Info, cls: "bg-surface-2 text-muted" },
};

function dayTitle(day: string, today: string): string {
  if (day === today) return "Hoy";
  if (day === addDays(today, 1)) return "Mañana";
  return new Date(`${day}T12:00:00Z`).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function timeAgo(iso: string): string {
  const min = Math.round((Date.now() - Date.parse(iso)) / 60_000);
  if (min < 60) return `hace ${Math.max(1, min)} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return `hace ${d} ${d === 1 ? "día" : "días"}`;
}

export function OverviewView({ data, greeting }: { data: Overview; greeting: string }) {
  const { mtd, prevMtd } = data;
  const totalPay = data.payments.reduce((s, p) => s + p.revenue, 0);
  const prettyToday = new Date(`${data.today}T12:00:00Z`).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  const last30 = data.daily.reduce((s, d) => s + d.revenue, 0);
  const prev30 = data.daily.reduce((s, d) => s + d.prevRevenue, 0);

  return (
    <>
      <PageHeader
        eyebrow={prettyToday}
        title={greeting}
        description="Así viene el negocio este mes. Las comparaciones son contra el mismo tramo del mes pasado (del 1 al día de hoy)."
        actions={
          <>
            <Link
              href="/admin/produccion"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong px-4 text-sm font-medium text-primary transition-colors hover:bg-surface-2"
            >
              <ChefHat className="size-4" /> Producción
            </Link>
            <Link
              href="/admin/pedidos"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-4 text-sm font-medium text-on-accent transition-colors hover:bg-accent-deep"
            >
              Ver pedidos <ChevronRight className="size-4" />
            </Link>
          </>
        }
      />

      <Stagger className="space-y-6">
        {/* KPIs principales */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard emphasis label="Facturación del mes" icon={Wallet} value={mtd.revenue} format="money" delta={pctChange(mtd.revenue, prevMtd.revenue)} />
          <StatCard label="Pedidos del mes" icon={ShoppingBag} value={mtd.orders} format="number" delta={pctChange(mtd.orders, prevMtd.orders)} />
          <StatCard label="Ticket promedio" icon={Receipt} value={mtd.avgTicket} format="money" delta={pctChange(mtd.avgTicket, prevMtd.avgTicket)} />
          {data.hasCosts ? (
            <StatCard
              label={`Ganancia estimada${data.marginPct !== null ? ` · margen ${data.marginPct.toLocaleString("es-AR")} %` : ""}`}
              icon={PiggyBank}
              value={mtd.profit}
              format="money"
              delta={pctChange(mtd.profit, prevMtd.profit)}
            />
          ) : (
            <StatCard label="Ganancia estimada" icon={PiggyBank} value={0} format="money" hint={<Link href="/admin/menu" className="text-accent underline-offset-2 hover:underline">Cargá costos en el menú para verla</Link>} />
          )}
        </div>

        {/* Indicadores de salud del negocio */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard label="Ventas ya comprometidas" icon={CalendarClock} value={data.committed.revenue} format="money" hint={`${data.committed.orders} pedidos con entrega de hoy en adelante`} />
          <StatCard label="Clientes que repiten" icon={Repeat} value={data.repeatRate} format="percent" hint="Compraron 2 veces o más" />
          <StatCard label="Cancelación" icon={Ban} value={data.cancelRate} format="percent" hint="Últimos 90 días" />
          <StatCard label="Anticipación promedio" icon={Hourglass} value={data.avgLeadDays ?? 0} format="days" hint="Entre el pedido y la entrega" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel
            className="flex flex-col lg:col-span-2"
            icon={TrendingUp}
            title="Facturación diaria"
            description="Últimos 30 días · la línea punteada son los 30 días anteriores"
            action={
              <div className="text-right">
                <p className="text-lg font-semibold tabular-nums text-cream">{formatPrice(last30, "ARS")}</p>
                <p className="text-xs text-muted">
                  {(() => {
                    const p = pctChange(last30, prev30);
                    return p === null ? "sin período previo" : `${p > 0 ? "+" : ""}${p.toLocaleString("es-AR")} % vs. 30 días previos`;
                  })()}
                </p>
              </div>
            }
          >
            <div className="min-h-56 flex-1">
              <AreaChart data={data.daily} />
            </div>
          </Panel>

          <Panel icon={AlertTriangle} title="Requiere atención" description="Lo que conviene resolver hoy">
            {data.alerts.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="Todo al día">
                No hay pedidos trabados ni entregas vencidas.
              </EmptyState>
            ) : (
              <ul className="space-y-2">
                {data.alerts.map((a, i) => {
                  const tone = ALERT_TONE[a.tone]!;
                  return (
                    <motion.li
                      key={a.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.07 }}
                    >
                      <Link
                        href={a.href}
                        className="group flex gap-3 rounded-xl border border-line p-3 transition-colors hover:border-line-strong hover:bg-surface-2"
                      >
                        <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", tone.cls)}>
                          <tone.icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-cream">{a.title}</span>
                          <span className="mt-0.5 block text-xs leading-snug text-muted">{a.detail}</span>
                        </span>
                        <ChevronRight className="mt-1 size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel
            className="lg:col-span-2"
            icon={Truck}
            title="Próximas entregas"
            description="Pedidos activos de los próximos 7 días"
            action={<PanelLink href="/admin/agenda">Ver agenda</PanelLink>}
          >
            {data.upcoming.length === 0 ? (
              <EmptyState icon={Truck} title="Sin entregas esta semana">
                Cuando confirmes pedidos con fecha, aparecen acá ordenados por día.
              </EmptyState>
            ) : (
              <ul className="divide-y divide-line">
                {data.upcoming.slice(0, 7).map((o) => {
                  const meta = STATUS_META[statusOf(o.status)];
                  const day = o.delivery_date as string;
                  const isSoon = day <= addDays(data.today, 1);
                  return (
                    <li key={o.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      <div
                        className={cn(
                          "w-20 shrink-0 rounded-xl px-2 py-1.5 text-center text-xs font-medium leading-tight first-letter:uppercase",
                          isSoon ? "bg-accent text-on-accent" : "bg-bg-deep text-primary"
                        )}
                      >
                        {dayTitle(day, data.today)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 text-sm font-medium text-cream">
                          <span className="truncate">{o.customer_name}</span>
                          <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: meta.bg, color: meta.fg }}>
                            {meta.label}
                          </span>
                        </p>
                        <p className="truncate text-xs text-muted">
                          {o.items.map((it) => `${it.quantity}× ${it.name}`).join(" · ")}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold tabular-nums text-cream">
                        {formatPrice(o.total_in_cents, "ARS")}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <div className="grid gap-6">
            <Panel icon={CreditCard} title="Medios de pago" description="Últimos 90 días">
              {data.payments.length === 0 ? (
                <p className="text-sm text-muted">Sin datos todavía.</p>
              ) : (
                <BarList
                  format="money"
                  items={data.payments.map((p) => ({
                    label: PAYMENT_LABELS[p.method as keyof typeof PAYMENT_LABELS] ?? p.method,
                    value: p.revenue,
                    sub: totalPay ? `${Math.round((p.revenue / totalPay) * 100)} %` : undefined,
                  }))}
                />
              )}
            </Panel>
            <Panel icon={Trophy} title="Lo más vendido del mes" action={<PanelLink href="/admin/estadisticas">Estadísticas</PanelLink>}>
              {data.topProducts.length === 0 ? (
                <p className="text-sm text-muted">Todavía no hay ventas este mes.</p>
              ) : (
                <BarList format="money" items={data.topProducts.map((p) => ({ label: p.name, value: p.revenue, sub: `${p.qty} u.` }))} />
              )}
            </Panel>

          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel className="lg:col-span-3" icon={Activity} title="Actividad reciente" action={<PanelLink href="/admin/pedidos">Todos los pedidos</PanelLink>}>
            <ul className="grid gap-x-6 gap-y-1 md:grid-cols-2">
              {data.recent.map((o) => {
                const meta = STATUS_META[statusOf(o.status)];
                return (
                  <motion.li key={o.id} variants={rise} className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface-2">
                      <span className="size-2 shrink-0 rounded-full" style={{ background: meta.dot }} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-cream">
                          {o.customer_name} <span className="text-muted">· {meta.label.toLowerCase()}</span>
                        </p>
                        <p className="text-xs text-muted">{timeAgo(o.created_at)}</p>
                      </div>
                      <span className="text-sm font-medium tabular-nums text-cream">{formatPrice(o.total_in_cents, "ARS")}</span>
                  </motion.li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </Stagger>
    </>
  );
}
