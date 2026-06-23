import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OrderRecord } from "@/lib/types/order";
import { formatPrice, formatUnit } from "@/lib/utils";
import { PAYMENT_LABELS } from "@/lib/whatsapp-order";

export const dynamic = "force-dynamic";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function OrdersPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      <div className="rounded-xl border border-line bg-surface p-8">
        <h1 className="font-display text-2xl text-cream">Pedidos</h1>
        <p className="mt-3 text-sm text-muted">
          Supabase no está configurado. Seguí los pasos de <code>SETUP-SUPABASE.md</code> para
          conectar la base de datos y ver los pedidos acá.
        </p>
      </div>
    );
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const orders = (data ?? []) as OrderRecord[];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="font-display text-3xl text-cream">Pedidos</h1>
        <span className="text-sm text-muted">{orders.length} en total</span>
      </div>

      {error && (
        <p className="rounded-base border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error.message}
        </p>
      )}

      {orders.length === 0 && !error && (
        <p className="rounded-xl border border-line bg-surface p-8 text-sm text-muted">
          Todavía no hay pedidos. Cuando un cliente confirme uno, aparece acá.
        </p>
      )}

      <div className="space-y-4">
        {orders.map((o) => (
          <article key={o.id} className="rounded-xl border border-line bg-surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg text-cream">{o.customer_name}</h2>
                <p className="text-sm text-muted">
                  {o.customer_phone} · {o.address}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-xl text-accent">
                  {formatPrice(o.total_in_cents, "ARS")}
                </p>
                <p className="text-xs text-muted">{formatDateTime(o.created_at)}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-bg-deep px-3 py-1 text-primary/80">
                Pago: {PAYMENT_LABELS[o.payment_method] ?? o.payment_method}
              </span>
              {o.delivery_date && (
                <span className="rounded-full bg-bg-deep px-3 py-1 text-primary/80">
                  Entrega: {o.delivery_date}
                </span>
              )}
              <span className="rounded-full bg-accent/10 px-3 py-1 text-accent">{o.status}</span>
            </div>

            <ul className="mt-4 space-y-1 border-t border-line pt-4 text-sm text-primary/85">
              {o.items.map((it, idx) => (
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

            {o.notes && <p className="mt-3 text-xs text-muted">Notas: {o.notes}</p>}
          </article>
        ))}
      </div>
    </div>
  );
}
