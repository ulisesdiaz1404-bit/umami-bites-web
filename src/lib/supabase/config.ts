// Configuración central de Supabase. Si faltan las env vars, el sitio sigue
// funcionando con el menú mock (fallback) y el admin queda deshabilitado.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
/** Solo servidor. NUNCA exponer al cliente (bypassa RLS). */
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** true cuando hay URL + anon key (lo mínimo para leer/loguear). */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
