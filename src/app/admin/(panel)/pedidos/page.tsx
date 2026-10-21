import { OrdersDashboard } from "@/components/admin/orders-dashboard";
import { AdminDataError } from "@/components/admin/data-error";
import { loadAdminData } from "@/lib/admin/data";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/admin/orders";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const [data, { estado }] = await Promise.all([loadAdminData(), searchParams]);
  if (!data.ok) return <AdminDataError title="Pedidos" result={data} />;

  const initialFilter = (ORDER_STATUSES as string[]).includes(estado ?? "") ? (estado as OrderStatus) : "todos";
  return <OrdersDashboard orders={data.orders} costMap={data.costMap} initialFilter={initialFilter} />;
}
