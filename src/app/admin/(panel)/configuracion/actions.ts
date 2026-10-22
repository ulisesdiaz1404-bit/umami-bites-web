"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { geocodeAddress, type GeoHit } from "@/lib/geo/nominatim";

export interface SettingsFormState {
  ok: boolean;
  error?: string;
  /** Guardado OK pero con algo para revisar (ej. dirección no encontrada). */
  warning?: string;
  /** Dirección del local tal como la ubicó el mapa. */
  matched?: string;
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

  // La dirección del local es el punto de partida del cálculo de envío:
  // la ubicamos en el mapa al guardar.
  const address = str(formData.get("address"));
  let origin: GeoHit | null = null;
  let warning: string | undefined;
  if (address) {
    try {
      origin = await geocodeAddress(address);
    } catch {
      // Nominatim caído: se guarda igual, con aviso.
    }
    if (!origin) {
      warning =
        "No pudimos ubicar la dirección del local en el mapa. El envío se sigue calculando desde la ubicación anterior. Probá escribirla con calle, número y localidad.";
    }
  }

  const row = {
    id: 1,
    whatsapp: digits(formData.get("whatsapp")),
    orders_whatsapp: digits(formData.get("ordersWhatsapp")),
    phone_primary: str(formData.get("phonePrimary")),
    phone_secondary: str(formData.get("phoneSecondary")),
    address,
    hours: str(formData.get("hours")),
    shipping_in_cents: cents(formData.get("shipping")),
    shipping_per_km_in_cents: cents(formData.get("shippingPerKm")),
    min_order_in_cents: cents(formData.get("minOrder")),
    // Si no se pudo ubicar, no pisamos las coordenadas que ya había.
    ...(origin ? { origin_lat: origin.lat, origin_lng: origin.lng } : {}),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("settings").upsert(row);
  if (error) {
    if (/shipping_per_km|origin_l/.test(error.message)) {
      return {
        ok: false,
        error:
          "Falta correr la migración supabase/migrations/0004_gallery_shipping.sql en el SQL Editor de Supabase.",
      };
    }
    return { ok: false, error: error.message };
  }

  // Refresca el layout del storefront (footer, envío, mínimo, WhatsApp) y el
  // propio panel de configuración.
  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracion");
  return { ok: true, warning, matched: origin?.matched };
}
