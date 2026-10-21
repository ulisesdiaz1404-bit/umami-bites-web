import { loadAdminData } from "@/lib/admin/data";
import { computeOverview, TZ } from "@/lib/admin/analytics";
import { OverviewView } from "@/components/admin/overview";
import { AdminDataError } from "@/components/admin/data-error";

export const dynamic = "force-dynamic";

function greeting(): string {
  const h = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: TZ }));
  if (h >= 5 && h < 13) return "Buen día";
  if (h >= 13 && h < 20) return "Buenas tardes";
  return "Buenas noches";
}

export default async function ResumenPage() {
  const data = await loadAdminData();
  if (!data.ok) return <AdminDataError title="Resumen" result={data} />;
  return <OverviewView data={computeOverview(data.orders, data.costMap)} greeting={greeting()} />;
}
