import type { Metadata } from "next";
import { cookies } from "next/headers";
import { NewOrderNotifier } from "@/components/admin/new-order-notifier";
import { AdminShell } from "@/components/admin/admin-shell";
import { loadAdminData, loadAdminUser } from "@/lib/admin/data";
import { computeNavCounts } from "@/lib/admin/analytics";

export const metadata: Metadata = {
  title: "Panel · Umami Bites",
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const [data, email, cookieStore] = await Promise.all([loadAdminData(), loadAdminUser(), cookies()]);
  const counts = data.ok ? computeNavCounts(data.orders) : { newOrders: 0, deliveriesSoon: 0, alerts: 0 };
  // El estado del menú (abierto/contraído) se lee de la cookie: sin salto al cargar.
  const defaultOpen = cookieStore.get("admin-sidebar")?.value !== "0";

  return (
    <>
      <NewOrderNotifier />
      <AdminShell counts={counts} email={email} demo={data.ok && data.demo} defaultOpen={defaultOpen}>
        <div className="mx-auto w-full max-w-[1240px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </AdminShell>
    </>
  );
}
