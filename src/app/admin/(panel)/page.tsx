import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OrderRecord } from "@/lib/types/order";
import { OrdersDashboard } from "@/components/admin/orders-dashboard";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8">
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

  if (error) {
    return (
      <div className="rounded-2xl border border-danger/40 bg-danger/10 p-8">
        <h1 className="font-display text-2xl text-cream">Pedidos</h1>
        <p className="mt-3 text-sm text-danger">{error.message}</p>
      </div>
    );
  }

  return <OrdersDashboard orders={orders} />;
}
