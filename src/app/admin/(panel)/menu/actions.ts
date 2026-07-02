"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const servingsRaw = String(formData.get("servings") ?? "").trim();

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
  };

  const result = id
    ? await supabase.from("menu_items").update(row).eq("id", id)
    : await supabase.from("menu_items").insert({ ...row, id: slug });

  if (result.error) return { ok: false, error: result.error.message };

  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/");
  return { ok: true };
}

/** Cambia solo la disponibilidad de un ítem (toggle rápido desde la lista). */
export async function setAvailability(id: string, available: boolean): Promise<MenuFormState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase no está configurado." };

  const { error } = await supabase.from("menu_items").update({ available }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/");
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
