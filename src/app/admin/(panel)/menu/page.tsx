import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/data/mock-menu";
import { formatPrice } from "@/lib/utils";
import type { MenuItem } from "@/lib/types/menu-item";
import { MenuForm } from "./menu-form";
import { DeleteButton } from "./delete-button";

export const dynamic = "force-dynamic";

interface MenuItemRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_in_cents: number;
  available: boolean;
  max_quantity: number;
  category: string;
  type: "dish" | "package";
  servings: number | null;
  includes: string[] | null;
  images: { url: string; alt: string }[] | null;
}

function rowToItem(r: MenuItemRow): MenuItem {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    priceInCents: r.price_in_cents,
    currency: "ARS",
    images: r.images ?? [],
    available: r.available,
    maxQuantity: r.max_quantity,
    category: r.category,
    type: r.type,
    servings: r.servings ?? undefined,
    includes: r.includes ?? undefined,
  };
}

export default async function AdminMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      <div className="rounded-xl border border-line bg-surface p-8">
        <h1 className="font-display text-2xl text-cream">Menú</h1>
        <p className="mt-3 text-sm text-muted">
          Supabase no está configurado. Seguí <code>SETUP-SUPABASE.md</code> y corré el seed
          para administrar el menú desde acá.
        </p>
      </div>
    );
  }

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .order("sort_order", { ascending: true });

  const items = ((data ?? []) as MenuItemRow[]).map(rowToItem);
  const editing = edit ? items.find((i) => i.id === edit) : undefined;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
      <section>
        <h1 className="font-display text-3xl text-cream">Menú</h1>
        <p className="mt-2 text-sm text-muted">{items.length} ítems. Editá precios y disponibilidad.</p>

        {error && (
          <p className="mt-4 rounded-base border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error.message}
          </p>
        )}

        <ul className="mt-6 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-base border border-line bg-surface px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-cream">
                  {item.name}{" "}
                  {!item.available && <span className="text-xs text-danger">(no disp.)</span>}
                </p>
                <p className="text-xs text-muted">
                  {item.category} · {formatPrice(item.priceInCents, "ARS")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={`/admin/menu?edit=${item.id}`}
                  className="rounded-full px-3 py-1.5 text-xs text-accent transition-colors hover:bg-accent/10"
                >
                  Editar
                </a>
                <DeleteButton id={item.id} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="lg:sticky lg:top-10 lg:h-fit">
        <MenuForm key={editing?.id ?? "new"} item={editing} categories={[...CATEGORIES]} />
      </section>
    </div>
  );
}
