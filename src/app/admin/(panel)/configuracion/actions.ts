"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface SettingsFormState {
  ok: boolean;
  error?: string;
}

const str = (v: FormDataEntryValue | null) => String(v ?? "").trim() || null;
const digits = (v: FormDataEntryValue | null) => String(v ?? "").replace(/\D/g, "") || null;
const cents = (v: FormDataEntryValue | null) => {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) ? Math.max(0, Math.round(n * 100)) : null;
};

export async function saveSettings(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase no está configurado." };

  const row = {
    id: 1,
    whatsapp: digits(formData.get("whatsapp")),
    orders_whatsapp: digits(formData.get("ordersWhatsapp")),
    phone_primary: str(formData.get("phonePrimary")),
    phone_secondary: str(formData.get("phoneSecondary")),
    address: str(formData.get("address")),
    hours: str(formData.get("hours")),
    shipping_in_cents: cents(formData.get("shipping")),
    min_order_in_cents: cents(formData.get("minOrder")),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("settings").upsert(row);
  if (error) return { ok: false, error: error.message };

  // Refresca el layout del storefront (footer, envío, mínimo, WhatsApp) y el
  // propio panel de configuración.
  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracion");
  return { ok: true };
}
