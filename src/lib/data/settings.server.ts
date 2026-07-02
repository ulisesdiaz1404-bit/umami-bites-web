import { createPublicClient } from "@/lib/supabase/public";
import { DEFAULT_SETTINGS, type BusinessSettings } from "@/lib/data/settings";

// =====================================================================
// Lectura de la configuración del negocio desde Supabase (solo servidor).
// Sin capa de caché propia (igual que menu.ts / categories.ts): se apoya en
// el revalidate/ISR de cada página + el revalidatePath("/", "layout") que
// dispara el guardado en el panel, así el cambio se ve al instante.
// Si la tabla no existe o está vacía, devuelve DEFAULT_SETTINGS (el sitio
// funciona igual sin haber corrido la migración 0002).
// =====================================================================

interface SettingsRow {
  whatsapp: string | null;
  orders_whatsapp: string | null;
  phone_primary: string | null;
  phone_secondary: string | null;
  address: string | null;
  hours: string | null;
  shipping_in_cents: number | null;
  min_order_in_cents: number | null;
}

export async function getSettings(): Promise<BusinessSettings> {
  const supabase = createPublicClient();
  if (!supabase) return DEFAULT_SETTINGS;

  const { data, error } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  if (error || !data) return DEFAULT_SETTINGS;

  const r = data as SettingsRow;
  const d = DEFAULT_SETTINGS;
  return {
    whatsapp: r.whatsapp || d.whatsapp,
    ordersWhatsapp: r.orders_whatsapp || d.ordersWhatsapp,
    phonePrimary: r.phone_primary || d.phonePrimary,
    phoneSecondary: r.phone_secondary || d.phoneSecondary,
    address: r.address ?? d.address,
    hours: r.hours ?? d.hours,
    shippingInCents: r.shipping_in_cents ?? d.shippingInCents,
    minOrderInCents: r.min_order_in_cents ?? d.minOrderInCents,
  };
}
