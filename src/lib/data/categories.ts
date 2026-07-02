import { createPublicClient } from "@/lib/supabase/public";
import { CATEGORIES, SERVICE_GROUPS, serviceGroupOf } from "@/lib/data/mock-menu";
import type { ServiceGroup } from "@/lib/data/mock-menu";

// =====================================================================
// Categorías del menú. Si la tabla `categories` existe y tiene filas, es la
// fuente de verdad (editable por el dueño). Si no, cae al catálogo hardcoded.
// Así el sitio funciona aunque no se haya corrido la migración 0002.
// =====================================================================

export interface CategoryDef {
  name: string;
  group: ServiceGroup;
  sort: number;
}

function normGroup(g: string): ServiceGroup {
  return (SERVICE_GROUPS as readonly string[]).includes(g)
    ? (g as ServiceGroup)
    : "Picadas y complementos";
}

/** Categorías por defecto (fallback) derivadas del catálogo hardcoded. */
export function defaultCategories(): CategoryDef[] {
  return CATEGORIES.map((name, i) => ({ name, group: serviceGroupOf(name), sort: i }));
}

export async function getCategories(): Promise<CategoryDef[]> {
  const supabase = createPublicClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("categories")
      .select("name, service_group, sort_order")
      .order("sort_order", { ascending: true });
    if (!error && data && data.length > 0) {
      return (data as { name: string; service_group: string; sort_order: number }[]).map((r) => ({
        name: r.name,
        group: normGroup(r.service_group),
        sort: r.sort_order,
      }));
    }
  }
  return defaultCategories();
}

/** Mapa nombre → grupo, con fallback a serviceGroupOf para nombres sueltos. */
export function groupMapOf(cats: CategoryDef[]): Record<string, ServiceGroup> {
  const map: Record<string, ServiceGroup> = {};
  for (const c of cats) map[c.name] = c.group;
  return map;
}
