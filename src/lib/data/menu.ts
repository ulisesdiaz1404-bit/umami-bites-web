import type { MenuItem, MenuImage } from "@/lib/types/menu-item";
import { MENU_ITEMS, CATEGORIES, SERVICE_GROUPS, serviceGroupOf } from "@/lib/data/mock-menu";
import { createPublicClient } from "@/lib/supabase/public";

// =====================================================================
// Capa de datos del menú. Lee de Supabase si está configurado; si no (o si
// la tabla está vacía / hay error), cae al catálogo mock. Así el sitio nunca
// se rompe por falta de DB y las ediciones del admin se reflejan cuando hay DB.
// Los componentes consumen el type MenuItem, no saben de dónde viene.
// =====================================================================

export { CATEGORIES, SERVICE_GROUPS, serviceGroupOf };
export type { ServiceGroup } from "@/lib/data/mock-menu";

interface MenuRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_in_cents: number;
  currency: MenuItem["currency"];
  images: MenuImage[] | null;
  available: boolean;
  max_quantity: number;
  category: string;
  type: MenuItem["type"];
  servings: number | null;
  includes: string[] | null;
  metadata: Record<string, string> | null;
}

function rowToMenuItem(r: MenuRow): MenuItem {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    priceInCents: r.price_in_cents,
    currency: r.currency,
    images: Array.isArray(r.images) ? r.images : [],
    available: r.available,
    maxQuantity: r.max_quantity,
    category: r.category,
    type: r.type,
    servings: r.servings ?? undefined,
    includes: r.includes ?? undefined,
    metadata: r.metadata ?? undefined,
  };
}

/** Trae todos los ítems (DB o mock). Una sola query; el resto filtra en JS. */
async function fetchAllItems(): Promise<MenuItem[]> {
  const supabase = createPublicClient();
  if (!supabase) return MENU_ITEMS;

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return MENU_ITEMS;
  return (data as MenuRow[]).map(rowToMenuItem);
}

// --------------------------- API pública (async) ---------------------------

export async function getAllItems(): Promise<MenuItem[]> {
  return fetchAllItems();
}

export async function getItemBySlug(slug: string): Promise<MenuItem | undefined> {
  return (await fetchAllItems()).find((item) => item.slug === slug);
}

export async function getFeaturedDishes(limit = 4): Promise<MenuItem[]> {
  return (await fetchAllItems()).filter((i) => i.type === "dish").slice(0, limit);
}

export async function getPackages(): Promise<MenuItem[]> {
  return (await fetchAllItems()).filter((i) => i.type === "package");
}

/** Paquetes destacados para la home (picadas + menús estrella). */
export async function getFeaturedPackages(limit = 4): Promise<MenuItem[]> {
  const items = await fetchAllItems();
  const priority = [
    "picada-umami",
    "menu-asado-al-asador",
    "menu-comida-criolla",
    "picada-encuentro",
  ];
  const map = new Map(items.map((i) => [i.slug, i]));
  const featured = priority
    .map((slug) => map.get(slug))
    .filter((i): i is MenuItem => Boolean(i));
  // Si los slugs prioritarios no existen (DB editada), completa con paquetes.
  if (featured.length < limit) {
    for (const i of items) {
      if (i.type === "package" && !featured.includes(i)) featured.push(i);
      if (featured.length >= limit) break;
    }
  }
  return featured.slice(0, limit);
}

export async function getRelatedItems(item: MenuItem, limit = 3): Promise<MenuItem[]> {
  return (await fetchAllItems())
    .filter((i) => i.category === item.category && i.slug !== item.slug && i.available)
    .slice(0, limit);
}
