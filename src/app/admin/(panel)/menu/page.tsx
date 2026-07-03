import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import type { MenuItem } from "@/lib/types/menu-item";
import { getCategories } from "@/lib/data/categories";
import { MenuForm } from "./menu-form";
import { DeleteButton } from "./delete-button";
import { AvailabilityToggle } from "./availability-toggle";

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
  metadata: Record<string, string> | null;
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
    metadata: r.metadata ?? undefined,
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
      <div className="rounded-2xl border border-line bg-surface p-8">
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
  const disponibles = items.filter((i) => i.available).length;

  const cats = await getCategories();
  const categoryNames = Array.from(
    new Set([...cats.map((c) => c.name), ...items.map((i) => i.category)])
  ).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-cream">Menú</h1>
          <p className="mt-1 text-sm text-muted">
            {items.length} ítems · {disponibles} disponibles. Tocá el interruptor para activar/ocultar
            al instante.
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-base border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error.message}
        </p>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        {/* Lista de ítems */}
        <aside className="space-y-2">
          {items.map((item) => {
            const isEditing = editing?.id === item.id;
            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 rounded-xl border bg-surface p-2.5 transition-colors ${
                  isEditing ? "border-accent ring-1 ring-accent/30" : "border-line"
                }`}
              >
                <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-bg-deep">
                  {item.images[0]?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.images[0].url}
                      alt={item.name}
                      className="size-full object-cover"
                      style={{ filter: item.available ? "none" : "grayscale(1)" }}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-cream">{item.name}</p>
                  <p className="text-xs text-muted">
                    {item.category} · {formatPrice(item.priceInCents, "ARS")}
                  </p>
                </div>
                <AvailabilityToggle id={item.id} available={item.available} />
                <a
                  href={`/admin/menu?edit=${item.id}`}
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
                >
                  Editar
                </a>
                <DeleteButton id={item.id} />
              </div>
            );
          })}
        </aside>

        {/* Editor + vista previa */}
        <MenuForm key={editing?.id ?? "new"} item={editing} categories={categoryNames} />
      </div>
    </div>
  );
}
