import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SERVICE_GROUPS } from "@/lib/data/mock-menu";
import { CategoriesManager, type CatRow } from "./categories-manager";
import { SeedButton } from "./seed-button";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8">
        <h1 className="font-display text-2xl text-cream">Categorías</h1>
        <p className="mt-3 text-sm text-muted">Conectá Supabase para gestionar categorías.</p>
      </div>
    );
  }

  const { data, error } = await supabase
    .from("categories")
    .select("name, service_group, sort_order")
    .order("sort_order", { ascending: true });

  // Tabla inexistente (migración 0002 sin correr) → instrucciones, sin romper.
  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl text-cream">Categorías</h1>
        <div className="rounded-2xl border border-[#e8d3ac] bg-[#f7edda] p-6 text-sm text-[#8a5a1e]">
          <p className="font-semibold">Falta un paso de configuración (una sola vez).</p>
          <p className="mt-2">
            Para editar categorías desde acá, corré la migración{" "}
            <code>supabase/migrations/0002_categories_settings.sql</code> en el SQL Editor de
            Supabase. Mientras tanto, el menú público sigue funcionando con las categorías por
            defecto.
          </p>
          <p className="mt-2 text-xs opacity-80">Detalle técnico: {error.message}</p>
        </div>
      </div>
    );
  }

  const rows: CatRow[] = (
    (data ?? []) as { name: string; service_group: string; sort_order: number }[]
  ).map((r) => ({ name: r.name, group: r.service_group, sort: r.sort_order }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-cream">Categorías</h1>
        <p className="mt-1 text-sm text-muted">
          Creá y organizá las categorías del menú. Cada una pertenece a una de las 3 pestañas
          grandes.
        </p>
      </div>

      {rows.length === 0 && (
        <div className="rounded-2xl border border-line bg-surface p-6">
          <p className="text-sm text-muted">
            Todavía no cargaste categorías. Podés empezar con las actuales del catálogo y después
            editarlas.
          </p>
          <div className="mt-4">
            <SeedButton />
          </div>
        </div>
      )}

      <CategoriesManager initial={rows} groups={[...SERVICE_GROUPS]} />
    </div>
  );
}
