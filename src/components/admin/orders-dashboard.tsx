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
  Trash2,
  Star,
  History,
  type LucideIcon,
} from "lucide-react";
import type { OrderRecord } from "@/lib/types/order";
import { PageHeader, Stagger, StatCard } from "@/components/admin/kit";
import { dayKey } from "@/lib/admin/analytics";
import { formatPrice, formatUnit } from "@/lib/utils";
import { PAYMENT_LABELS, buildReviewHref } from "@/lib/whatsapp-order";
import {
  updateOrderStatus,
  deleteOrder,
  deleteDeliveredOrders,
} from "@/app/admin/(panel)/actions";
import {
  STATUS_META as STATUS,
  statusOf,
  waHref,
  fmtDateTime,
  baseMenuItemId,
  type OrderStatus,
} from "@/lib/admin/orders";

type Filter = "todos" | OrderStatus;

export function OrdersDashboard({
  orders,
  costMap = {},
  initialFilter = "todos",
}: {
  orders: OrderRecord[];
  costMap?: Record<string, number>;
  initialFilter?: Filter;
}) {
  const [filter, setFilter] = useState<Filter>(initialFilter);

  const metrics = useMemo(() => {
    const active = orders.filter((o) => statusOf(o.status) !== "cancelado");
    const revenue = active.reduce((s, o) => s + o.total_in_cents, 0);
    // Costo de mercadería: suma del costo actual de cada ítem × cantidad.
    // Un costo mayor al precio de venta es un dato mal cargado: no se cuenta.
    const cost = active.reduce(
      (s, o) =>
        s +
        o.items.reduce((si, it) => {
          const c = costMap[baseMenuItemId(it.menuItemId)] ?? 0;
          return si + (c > it.priceInCents ? 0 : c) * it.quantity;
        }, 0),
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

  // Entregados "viejos": se ocultan de la lista para que quede solo lo que hay que
  // atender, pero NO se borran (siguen contando en métricas, estadísticas y clientes).
  // No se guarda la hora de entrega, así que se usa la fecha de entrega: se ocultan
  // desde el día siguiente. Sin fecha, 24 h después de creado el pedido.
  const [showArchived, setShowArchived] = useState(false);
  const archived = useMemo(() => {
    const today = dayKey(new Date());
    const cutoff = Date.now() - 24 * 3_600_000;
    return new Set(
      orders
        .filter(
          (o) =>
            statusOf(o.status) === "entregado" &&
            (o.delivery_date ? o.delivery_date < today : Date.parse(o.created_at) < cutoff)
        )
        .map((o) => o.id)
    );
  }, [orders]);
  const visible = useMemo(
    () => (showArchived ? orders : orders.filter((o) => !archived.has(o.id))),
    [orders, archived, showArchived]
  );

  const filtered = useMemo(
    () => (filter === "todos" ? visible : visible.filter((o) => statusOf(o.status) === filter)),
    [visible, filter]
  );

  const countOf = (st: OrderStatus) => visible.filter((o) => statusOf(o.status) === st).length;
  const counts: Record<Filter, number> = {
    todos: visible.length,
    nuevo: countOf("nuevo"),
    confirmado: countOf("confirmado"),
    entregado: countOf("entregado"),
    cancelado: countOf("cancelado"),
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Pedidos"
        description="Facturación y estado de cada pedido. Los cancelados no cuentan en los ingresos."
      />

      {/* KPIs */}
      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {metrics.hasCosts && (
          <StatCard icon={TrendingUp} label="Ganancia estimada" value={metrics.profit} format="money" />
        )}
        <StatCard icon={Wallet} label="Facturado (activos)" value={metrics.revenue} format="money" />
        {metrics.hasCosts && (
          <StatCard icon={Coins} label="Costo de mercadería" value={metrics.cost} format="money" />
        )}
        <StatCard icon={CalendarDays} label="Este mes" value={metrics.monthRevenue} format="money" />
        <StatCard icon={Receipt} label="Ticket promedio" value={metrics.avgTicket} format="money" />
        <StatCard icon={ShoppingBag} label="Pedidos activos" value={metrics.activeCount} format="number" />
      </Stagger>

      {/* Filtros por estado + limpieza de entregados */}
      <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        {(["todos", "nuevo", "confirmado", "entregado", "cancelado"] as Filter[]).map((f) => {
          const isActive = filter === f;
          const meta = f === "todos" ? null : STATUS[f];
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
                isActive ? "text-white" : "border-line bg-surface text-muted hover:text-cream"
              }`}
              style={isActive ? { background: meta?.dot ?? "var(--color-accent)", borderColor: meta?.dot ?? "var(--color-accent)" } : undefined}
            >
              {f === "todos" ? "Todos" : meta?.label} ({counts[f]})
            </button>
          );
        })}
      </div>
        {metrics.entregados > 0 && <BulkDeleteDelivered count={metrics.entregados} />}
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

      {archived.size > 0 && (filter === "todos" || filter === "entregado") && (
        <div className="flex flex-col items-center gap-2 border-t border-line pt-6 text-center">
          <p className="text-xs text-muted">
            {showArchived
              ? "Mostrando también los entregados anteriores."
              : `${archived.size} ${archived.size === 1 ? "pedido entregado se ocultó" : "pedidos entregados se ocultaron"} de la lista (pasaron más de 24 h). Siguen contando en las métricas.`}
          </p>
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-surface-2"
          >
            <History className="size-4" />
            {showArchived ? "Ocultar entregados anteriores" : `Ver entregados anteriores (${archived.size})`}
          </button>
        </div>
      )}
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
            <>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                <CheckCircle2 className="size-4" /> Pedido entregado
              </span>
              <a
                href={buildReviewHref(order.customer_phone, order.customer_name)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#c9871f]/50 px-4 py-2 text-xs font-semibold text-accent transition-colors hover:bg-[#c9871f]/10"
              >
                <Star className="size-4" /> Pedir reseña
              </a>
            </>
          )}

          {(status === "entregado" || status === "cancelado") && (
            <button
              type="button"
              onClick={() => {
                if (confirm("¿Borrar este pedido para siempre? No se puede deshacer.")) {
                  setError(null);
                  startTransition(async () => {
                    const res = await deleteOrder(order.id);
                    if (!res.ok) setError(res.error ?? "No se pudo borrar.");
                    else router.refresh();
                  });
                }
              }}
              disabled={pending}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
            >
              <Trash2 className="size-4" /> Borrar
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function BulkDeleteDelivered({ count }: { count: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm(`¿Borrar los ${count} pedidos entregados para siempre? No se puede deshacer.`)) {
          startTransition(async () => {
            await deleteDeliveredOrders();
            router.refresh();
          });
        }
      }}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#c0563f]/40 px-3.5 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-[#c0563f]/10 disabled:opacity-50"
    >
      <Trash2 className="size-3.5" /> {pending ? "Borrando…" : `Borrar entregados (${count})`}
    </button>
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
    danger: "border border-[#c0563f]/50 text-danger hover:bg-[#c0563f]/10",
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
