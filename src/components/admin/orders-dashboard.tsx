"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  ShoppingBag,
  Receipt,
  CalendarDays,
  TrendingUp,
  Coins,
  CheckCircle2,
  XCircle,
  Truck,
  Phone,
  MapPin,
  Clock,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import type { OrderRecord } from "@/lib/types/order";
import { formatPrice, formatUnit } from "@/lib/utils";
import { PAYMENT_LABELS } from "@/lib/whatsapp-order";
import { updateOrderStatus } from "@/app/admin/(panel)/actions";
import {
  STATUS_META as STATUS,
  statusOf,
  waHref,
  fmtDateTime,
  type OrderStatus,
} from "@/lib/admin/orders";

type Filter = "todos" | OrderStatus;

export function OrdersDashboard({
  orders,
  costMap = {},
}: {
  orders: OrderRecord[];
  costMap?: Record<string, number>;
}) {
  const [filter, setFilter] = useState<Filter>("todos");

  const metrics = useMemo(() => {
    const active = orders.filter((o) => statusOf(o.status) !== "cancelado");
    const revenue = active.reduce((s, o) => s + o.total_in_cents, 0);
    // Costo de mercadería: suma del costo actual de cada ítem × cantidad.
    const cost = active.reduce(
      (s, o) => s + o.items.reduce((si, it) => si + (costMap[it.menuItemId] ?? 0) * it.quantity, 0),
      0
    );
    const hasCosts = Object.keys(costMap).length > 0;
    const now = new Date();
    const monthRevenue = active
      .filter((o) => {
        const d = new Date(o.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, o) => s + o.total_in_cents, 0);
    const byStatus = (s: OrderStatus) => orders.filter((o) => statusOf(o.status) === s).length;
    return {
      revenue,
      cost,
      profit: revenue - cost,
      hasCosts,
      monthRevenue,
      activeCount: active.length,
      avgTicket: active.length ? Math.round(revenue / active.length) : 0,
      nuevos: byStatus("nuevo"),
      entregados: byStatus("entregado"),
      cancelados: byStatus("cancelado"),
    };
  }, [orders, costMap]);

  const filtered = useMemo(
    () => (filter === "todos" ? orders : orders.filter((o) => statusOf(o.status) === filter)),
    [orders, filter]
  );

  const counts: Record<Filter, number> = {
    todos: orders.length,
    nuevo: metrics.nuevos,
    confirmado: orders.filter((o) => statusOf(o.status) === "confirmado").length,
    entregado: metrics.entregados,
    cancelado: metrics.cancelados,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-cream">Pedidos</h1>
        <p className="mt-1 text-sm text-muted">
          Facturación y estado de cada pedido. La cancelación no cuenta en los ingresos.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.hasCosts && (
          <Kpi
            icon={TrendingUp}
            label="Ganancia estimada"
            value={formatPrice(metrics.profit, "ARS")}
            accent="#2f8f4e"
            tint="#e6f1e8"
          />
        )}
        <Kpi
          icon={Wallet}
          label="Facturado (activos)"
          value={formatPrice(metrics.revenue, "ARS")}
          accent="#2563eb"
          tint="#e9effc"
        />
        {metrics.hasCosts && (
          <Kpi
            icon={Coins}
            label="Costo de mercadería"
            value={formatPrice(metrics.cost, "ARS")}
            accent="#a83422"
            tint="#f8e7e3"
          />
        )}
        <Kpi
          icon={CalendarDays}
          label="Este mes"
          value={formatPrice(metrics.monthRevenue, "ARS")}
          accent="#0d9488"
          tint="#e2f3f1"
        />
        <Kpi
          icon={Receipt}
          label="Ticket promedio"
          value={formatPrice(metrics.avgTicket, "ARS")}
          accent="#7c3aed"
          tint="#efe9fb"
        />
        <Kpi
          icon={ShoppingBag}
          label="Pedidos activos"
          value={String(metrics.activeCount)}
          accent="#c9871f"
          tint="#f7edda"
        />
      </div>

      {/* Filtros por estado */}
      <div className="flex flex-wrap gap-2">
        {(["todos", "nuevo", "confirmado", "entregado", "cancelado"] as Filter[]).map((f) => {
          const isActive = filter === f;
          const meta = f === "todos" ? null : STATUS[f];
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="rounded-full border px-4 py-1.5 text-xs font-medium capitalize transition-colors"
              style={{
                background: isActive ? (meta?.dot ?? "#4a361f") : "#fdf9f2",
                color: isActive ? "#fff" : "#6b5236",
                borderColor: isActive ? (meta?.dot ?? "#4a361f") : "rgba(74,54,31,0.18)",
              }}
            >
              {f === "todos" ? "Todos" : meta?.label} ({counts[f]})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface p-10 text-center text-sm text-muted">
          No hay pedidos en este estado.
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  accent,
  tint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
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
      <p className="mt-0.5 text-xs uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

function OrderCard({ order }: { order: OrderRecord }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const status = statusOf(order.status);
  const meta = STATUS[status];

  function change(next: OrderStatus, confirmMsg?: string) {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setError(null);
    startTransition(async () => {
      const res = await updateOrderStatus(order.id, next);
      if (!res.ok) setError(res.error ?? "No se pudo actualizar.");
      else router.refresh();
    });
  }

  return (
    <article
      className="overflow-hidden rounded-2xl border bg-surface shadow-card"
      style={{ borderColor: meta.border }}
    >
      <div className="h-1.5 w-full" style={{ background: meta.dot }} />
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg text-cream">{order.customer_name}</h2>
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                style={{ background: meta.bg, color: meta.fg }}
              >
                {meta.label}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
              <a
                href={waHref(order.customer_phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#2f8f4e] hover:underline"
              >
                <Phone className="size-3.5" /> {order.customer_phone}
              </a>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" /> {order.address}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" /> {fmtDateTime(order.created_at)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl text-accent">
              {formatPrice(order.total_in_cents, "ARS")}
            </p>
            <p className="text-xs text-muted">{PAYMENT_LABELS[order.payment_method] ?? order.payment_method}</p>
          </div>
        </div>

        {order.delivery_date && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-bg-deep px-3 py-1 text-xs text-primary/80">
            <Truck className="size-3.5" /> Entrega: {order.delivery_date}
          </p>
        )}

        <ul className="mt-4 space-y-1 border-t border-line pt-4 text-sm text-primary/85">
          {order.items.map((it, idx) => (
            <li key={idx} className="flex justify-between gap-3">
              <span>
                {it.quantity} {formatUnit(it.quantity, it.unit)} — {it.name}
              </span>
              <span className="tabular-nums text-muted">
                {formatPrice(it.priceInCents * it.quantity, "ARS")}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-3 space-y-0.5 border-t border-line pt-3 text-xs text-muted">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatPrice(order.subtotal_in_cents, "ARS")}</span>
          </div>
          <div className="flex justify-between">
            <span>Envío</span>
            <span className="tabular-nums">{formatPrice(order.shipping_in_cents, "ARS")}</span>
          </div>
          <div className="flex justify-between font-semibold text-cream">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(order.total_in_cents, "ARS")}</span>
          </div>
        </div>

        {order.notes && (
          <p className="mt-3 inline-flex items-start gap-1.5 text-xs text-muted">
            <StickyNote className="mt-0.5 size-3.5 shrink-0" /> {order.notes}
          </p>
        )}

        {error && <p className="mt-3 text-xs text-danger">{error}</p>}

        {/* Acciones */}
        <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
          {status === "nuevo" && (
            <ActionBtn onClick={() => change("confirmado")} disabled={pending} tone="primary">
              <CheckCircle2 className="size-4" /> Confirmar
            </ActionBtn>
          )}
          {status === "confirmado" && (
            <ActionBtn onClick={() => change("entregado")} disabled={pending} tone="success">
              <Truck className="size-4" /> Marcar entregado
            </ActionBtn>
          )}
          {status === "cancelado" && (
            <ActionBtn onClick={() => change("nuevo")} disabled={pending} tone="neutral">
              Reactivar
            </ActionBtn>
          )}
          {(status === "nuevo" || status === "confirmado") && (
            <ActionBtn
              onClick={() => change("cancelado", "¿Cancelar este pedido?")}
              disabled={pending}
              tone="danger"
            >
              <XCircle className="size-4" /> Cancelar pedido
            </ActionBtn>
          )}
          {status === "entregado" && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2f6b3f]">
              <CheckCircle2 className="size-4" /> Pedido entregado
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function ActionBtn({
  children,
  onClick,
  disabled,
  tone,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone: "primary" | "success" | "danger" | "neutral";
}) {
  const tones: Record<string, string> = {
    primary: "bg-[#2563eb] text-white hover:bg-[#1e51c9]",
    success: "bg-[#2f8f4e] text-white hover:bg-[#277a43]",
    danger: "border border-[#c0563f]/50 text-[#a83422] hover:bg-[#c0563f]/10",
    neutral: "border border-line text-primary hover:bg-surface-2",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}
