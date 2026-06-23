import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "./config";

/**
 * Cliente con service role — SOLO servidor (Route Handlers / Server Actions).
 * Bypassa RLS, por eso jamás debe importarse en componentes de cliente.
 * Se usa para insertar pedidos sin abrir la tabla `orders` al público.
 */
export function createServiceRoleClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
