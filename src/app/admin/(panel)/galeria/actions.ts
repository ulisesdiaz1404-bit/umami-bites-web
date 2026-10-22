"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uploadPublicImage, removePublicImage } from "@/lib/supabase/storage";
import { DEFAULT_GALLERY, type GalleryRow } from "@/lib/data/gallery";

const IMAGE_BUCKET = "gallery-images";

export interface GalleryResult {
  ok: boolean;
  error?: string;
}

function revalidate() {
  revalidatePath("/admin/galeria");
  revalidatePath("/");
}

type Supabase = NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;

/** Mientras la tabla está vacía la web muestra las fotos por defecto: antes del
 *  primer cambio las copiamos a la tabla para no perderlas. */
async function ensureSeeded(supabase: Supabase): Promise<string | null> {
  const { count, error } = await supabase
    .from("gallery_photos")
    .select("id", { count: "exact", head: true });
  if (error) return error.message;
  if ((count ?? 0) > 0) return null;
  const rows = DEFAULT_GALLERY.map((p, i) => ({
    url: p.src,
    alt: p.alt,
    width: p.width,
    height: p.height,
    sort_order: i,
  }));
  const { error: insError } = await supabase.from("gallery_photos").insert(rows);
  return insError?.message ?? null;
}

/** Copia las fotos por defecto a la tabla para poder editarlas. */
export async function seedGallery(): Promise<GalleryResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase no está configurado." };
  const err = await ensureSeeded(supabase);
  if (err) return { ok: false, error: err };
  revalidate();
  return { ok: true };
}

/** Sube UNA foto (el cliente llama una vez por archivo) y la agrega al final. */
export async function addGalleryPhoto(formData: FormData): Promise<GalleryResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase no está configurado." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Elegí una foto." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: `“${file.name}” no es una imagen.` };
  }
  const dim = (k: string) => {
    const n = Math.round(Number(formData.get(k)));
    return Number.isFinite(n) && n > 0 ? n : 1200;
  };
  const alt = String(formData.get("alt") ?? "").trim();

  const seedErr = await ensureSeeded(supabase);
  if (seedErr) return { ok: false, error: seedErr };

  const uploaded = await uploadPublicImage(IMAGE_BUCKET, file, "galeria");
  if (uploaded.error || !uploaded.url) {
    return { ok: false, error: uploaded.error ?? "No se pudo subir la foto." };
  }

  const { data: last } = await supabase
    .from("gallery_photos")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("gallery_photos").insert({
    url: uploaded.url,
    alt,
    width: dim("width"),
    height: dim("height"),
    sort_order: ((last as { sort_order: number } | null)?.sort_order ?? -1) + 1,
  });
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}

export async function updateGalleryAlt(id: string, alt: string): Promise<GalleryResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase no está configurado." };
  const { error } = await supabase
    .from("gallery_photos")
    .update({ alt: alt.trim() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}

/** Mueve una foto un lugar antes (-1) o después (+1). */
export async function moveGalleryPhoto(id: string, dir: 1 | -1): Promise<GalleryResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase no está configurado." };

  const { data, error } = await supabase
    .from("gallery_photos")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });
  if (error) return { ok: false, error: error.message };

  const rows = (data ?? []) as Pick<GalleryRow, "id" | "sort_order">[];
  const i = rows.findIndex((r) => r.id === id);
  const j = i + dir;
  if (i === -1 || j < 0 || j >= rows.length) return { ok: true };

  // Reasigna 0..n en el nuevo orden (también arregla órdenes repetidos).
  [rows[i], rows[j]] = [rows[j]!, rows[i]!];
  const updates = rows.map((r, idx) =>
    supabase.from("gallery_photos").update({ sort_order: idx }).eq("id", r.id)
  );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, error: failed.error.message };
  revalidate();
  return { ok: true };
}

export async function deleteGalleryPhoto(id: string): Promise<GalleryResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase no está configurado." };

  const { data } = await supabase.from("gallery_photos").select("url").eq("id", id).maybeSingle();
  const { error } = await supabase.from("gallery_photos").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  // Libera el archivo del Storage (las fotos por defecto de /public no se tocan).
  const url = (data as { url: string } | null)?.url;
  if (url) await removePublicImage(IMAGE_BUCKET, url).catch(() => {});
  revalidate();
  return { ok: true };
}
