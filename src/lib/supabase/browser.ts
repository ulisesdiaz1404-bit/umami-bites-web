"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

/** Cliente de navegador para el login del admin (componentes de cliente). */
export function createSupabaseBrowserClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
