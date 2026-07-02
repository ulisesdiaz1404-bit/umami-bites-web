"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin-client";

const IMAGE_BUCKET = "menu-images";

/**
 * Sube una foto del menú a Supabase Storage y devuelve su URL pública.
 * Usa service role (server-only) y crea el bucket público si no existe, así el
 * dueño puede cambiar fotos desde el panel sin tocar código ni redeploy.
 */
async function uploadMenuImage(
  file: File,
  slug: string
): Promise<{ url?: string; error?: string }> {
  const admin = createServiceRoleClient();
  if (!admin) {
    return { error: "Para subir fotos falta configurar SUPABASE_SERVICE_ROLE_KEY." };
  }
  // Idempotente: si el bucket ya existe, devuelve error que ignoramos.
  await admin.storage.createBucket(IMAGE_BUCKET, {
    public: true,
    fileSizeLimit: "8MB",
  });

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${slug || "item"}-${Date.now()}.${ext}`;
  const { error } = await admin.storage.from(IMAGE_BUCKET).upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });
  if (error) return { error: `No se pudo subir la foto: ${error.message}` };

  const { data } = admin.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

export interface MenuFormState {
  ok: boolean;
  error?: string;
}

function parseIncludes(value: string): string[] | null {
  const arr = value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return arr.length ? arr : null;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Crea o actualiza un ítem del menú (usado con useActionState). */
export async function saveMenuItem(
  _prev: MenuFormState,
  formData: FormData
): Promise<MenuFormState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase no está configurado." };

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() || slugify(name);

  if (!name || !slug) return { ok: false, error: "Nombre y slug son obligatorios." };

  let imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const servingsRaw = String(formData.get("servings") ?? "").trim();

  // Costo → metadata.cost (en centavos), preservando otras claves (ej. unit).
  const costRaw = String(formData.get("cost") ?? "").trim();
  const costCents = costRaw ? Math.max(0, Math.round(Number(costRaw) * 100)) : 0;
  let metadata: Record<string, string> | null = null;
  let previousSlug: string | null = null;
  if (id) {
    const { data: existing } = await supabase
      .from("menu_items")
      .select("metadata, slug")
      .eq("id", id)
      .single();
    metadata = (existing?.metadata as Record<string, string> | null) ?? null;
    previousSlug = existing?.slug ?? null;
  }
  if (costCents > 0) {
    metadata = { ...(metadata ?? {}), cost: String(costCents) };
  } else if (metadata && "cost" in metadata) {
    const { cost: _drop, ...rest } = metadata;
    metadata = Object.keys(rest).length ? rest : null;
  }

  // Si el dueño subió un archivo, se sube a Storage y su URL pisa a la manual.
  const imageFile = formData.get("imageFile");
  if (imageFile instanceof File && imageFile.size > 0) {
    const uploaded = await uploadMenuImage(imageFile, slug);
    if (uploaded.error) return { ok: false, error: uploaded.error };
    if (uploaded.url) imageUrl = uploaded.url;
  }

  const row = {
    slug,
    name,
    description: String(formData.get("description") ?? "").trim(),
    price_in_cents: Math.round(Number(formData.get("price") ?? 0) * 100),
    currency: "ARS",
    available: formData.get("available") === "on",
    max_quantity: Math.max(1, Number(formData.get("maxQuantity") ?? 1)),
    category: String(formData.get("category") ?? "").trim(),
    type: String(formData.get("type") ?? "dish"),
    servings: servingsRaw ? Number(servingsRaw) : null,
    includes: parseIncludes(String(formData.get("includes") ?? "")),
    images: imageUrl ? [{ url: imageUrl, alt: name }] : [],
    metadata,
  };

  const result = id
    ? await supabase.from("menu_items").update(row).eq("id", id)
    : await supabase.from("menu_items").insert({ ...row, id: slug });

  if (result.error) return { ok: false, error: result.error.message };

  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/");
  // Revalida la página de detalle del ítem (y la del slug viejo si cambió),
  // así un rename no deja un 404 cacheado hasta que expire el ISR solo.
  revalidatePath(`/menu/${slug}`);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/menu/${previousSlug}`);
  return { ok: true };
}

/** Cambia solo la disponibilidad de un ítem (toggle rápido desde la lista). */
export async function setAvailability(id: string, available: boolean): Promise<MenuFormState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase no está configurado." };

  const { data: existing } = await supabase
    .from("menu_items")
    .select("slug")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("menu_items").update({ available }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/");
  if (existing?.slug) revalidatePath(`/menu/${existing.slug}`);
  return { ok: true };
}

/** Borra un ítem del menú. */
export async function deleteMenuItem(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;
  await supabase.from("menu_items").delete().eq("id", id);
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/");
}
