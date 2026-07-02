"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { defaultCategories } from "@/lib/data/categories";

export interface CatResult {
  ok: boolean;
  error?: string;
}

function revalidate() {
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/");
}

/** Crea o renombra una categoría (name es la PK). */
export async function upsertCategory(
  name: string,
  serviceGroup: string,
  sortOrder: number
): Promise<CatResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase no está configurado." };
  const clean = name.trim();
  if (!clean) return { ok: false, error: "El nombre no puede estar vacío." };

  const { error } = await supabase
    .from("categories")
    .upsert({ name: clean, service_group: serviceGroup, sort_order: sortOrder });
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}

export async function deleteCategory(name: string): Promise<CatResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase no está configurado." };
  const { error } = await supabase.from("categories").delete().eq("name", name);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}

/** Carga las categorías actuales del catálogo en la tabla (primera vez). */
export async function seedCategories(): Promise<CatResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase no está configurado." };
  const rows = defaultCategories().map((c) => ({
    name: c.name,
    service_group: c.group,
    sort_order: c.sort,
  }));
  const { error } = await supabase.from("categories").upsert(rows);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}
