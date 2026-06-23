import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./config";

/**
 * Cliente de servidor ligado a las cookies del request (sesión del admin).
 * Para usar en RSC del panel y en Server Actions. Devuelve null si no está
 * configurado Supabase.
 */
export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured) return null;
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Llamado desde un RSC sin permiso de escritura de cookies; el
          // middleware ya refresca la sesión, así que se puede ignorar.
        }
      },
    },
  });
}
