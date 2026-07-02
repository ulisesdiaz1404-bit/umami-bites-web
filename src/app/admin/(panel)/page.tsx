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

  const [{ data, error }, { data: menuData }] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("menu_items").select("id, metadata"),
  ]);

  const orders = (data ?? []) as OrderRecord[];

  // Mapa costo por ítem (centavos) desde metadata.cost, para calcular ganancia.
  const costMap: Record<string, number> = {};
  for (const m of (menuData ?? []) as { id: string; metadata: Record<string, string> | null }[]) {
    const c = Number(m.metadata?.cost ?? 0);
    if (c > 0) costMap[m.id] = c;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-danger/40 bg-danger/10 p-8">
        <h1 className="font-display text-2xl text-cream">Pedidos</h1>
        <p className="mt-3 text-sm text-danger">{error.message}</p>
      </div>
    );
  }

  return <OrdersDashboard orders={orders} costMap={costMap} />;
}
