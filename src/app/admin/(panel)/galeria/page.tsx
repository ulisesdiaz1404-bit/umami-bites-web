import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DEFAULT_GALLERY, type GalleryRow } from "@/lib/data/gallery";
import { GalleryManager } from "./gallery-manager";

export const dynamic = "force-dynamic";

export default async function GaleriaPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8">
        <h1 className="font-display text-2xl text-cream">Galería</h1>
        <p className="mt-3 text-sm text-muted">Conectá Supabase para editar la galería.</p>
      </div>
    );
  }

  const { data, error } = await supabase
    .from("gallery_photos")
    .select("id, url, alt, width, height, sort_order")
    .order("sort_order", { ascending: true });

  // Tabla inexistente (migración 0004 sin correr) → instrucciones, sin romper.
  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl text-cream">Galería</h1>
        <div className="rounded-2xl border border-accent/30 bg-accent/10 p-6 text-sm text-accent">
          <p className="font-semibold">Falta un paso de configuración (una sola vez).</p>
          <p className="mt-2">
            Para cambiar las fotos desde acá, corré la migración{" "}
            <code>supabase/migrations/0004_gallery_shipping.sql</code> en el SQL Editor de
            Supabase. Mientras tanto, la web sigue mostrando las fotos actuales.
          </p>
          <p className="mt-2 text-xs opacity-80">Detalle técnico: {error.message}</p>
        </div>
      </div>
    );
  }

  const rows = (data ?? []) as GalleryRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-cream">Galería</h1>
        <p className="mt-1 text-sm text-muted">
          Las fotos de “Así se ven nuestras mesas” en la página de inicio. Subí nuevas, cambiá el
          orden o borrá las que no quieras mostrar.
        </p>
      </div>

      <GalleryManager rows={rows} defaults={rows.length === 0 ? [...DEFAULT_GALLERY] : []} />
    </div>
  );
}
