import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { OrderRecord } from "@/lib/types/order";
import { demoCategoryMap, demoCostMap, demoOrders } from "@/lib/admin/demo-data";

/**
 * Modo demo: SOLO en local, sin Supabase y con ADMIN_DEMO=1 explícito.
 * En Vercel Supabase está configurado, así que es imposible que se active.
 */
export const isAdminDemo = !isSupabaseConfigured && process.env.ADMIN_DEMO === "1";

export type AdminData =
  | {
      ok: true;
      demo: boolean;
      orders: OrderRecord[];
      /** Costo por producto (centavos), de metadata.cost. */
      costMap: Record<string, number>;
      /** Categoría por producto. */
      categoryMap: Record<string, string>;
    }
  | { ok: false; reason: "not-configured" | "error"; message?: string };

/**
 * Pedidos + costos por producto (centavos) para las vistas del panel.
 * Con cache(): el layout (contadores) y la página comparten UNA sola consulta por request.
 */
export const loadAdminData = cache(async (): Promise<AdminData> => {
  if (isAdminDemo)
    return { ok: true, demo: true, orders: demoOrders(), costMap: demoCostMap(), categoryMap: demoCategoryMap() };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, reason: "not-configured" };

  const [{ data, error }, { data: menuData }] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("menu_items").select("id, category, metadata"),
  ]);
  if (error) return { ok: false, reason: "error", message: error.message };

  const costMap: Record<string, number> = {};
  const categoryMap: Record<string, string> = {};
  for (const m of (menuData ?? []) as { id: string; category: string; metadata: Record<string, string> | null }[]) {
    const c = Number(m.metadata?.cost ?? 0);
    if (c > 0) costMap[m.id] = c;
    categoryMap[m.id] = m.category;
  }
  return { ok: true, demo: false, orders: (data ?? []) as OrderRecord[], costMap, categoryMap };
});

/** Email del admin logueado (para el pie del menú lateral). */
export async function loadAdminUser(): Promise<string | null> {
  if (isAdminDemo) return "demo@umamibites.com.ar";
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? null;
}
