// Aplica el catálogo de mock-menu.ts a Supabase (upsert por id, no borra).
// Uso: npx tsx scripts/apply-seed.ts
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { MENU_ITEMS } from "../src/lib/data/mock-menu.ts";

// --- Cargar .env.local manualmente (tsx no lo hace solo) ---
const env: Record<string, string> = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const rows = MENU_ITEMS.map((it, idx) => ({
  id: it.id,
  slug: it.slug,
  name: it.name,
  description: it.description,
  price_in_cents: it.priceInCents,
  currency: it.currency,
  images: it.images,
  available: it.available,
  max_quantity: it.maxQuantity,
  category: it.category,
  type: it.type,
  servings: it.servings ?? null,
  includes: it.includes ?? null,
  metadata: it.metadata ?? null,
  sort_order: idx,
}));

async function main() {
  const { error, count } = await supabase
    .from("menu_items")
    .upsert(rows, { onConflict: "id", count: "exact" });

  if (error) {
    console.error("ERROR:", error.message);
    process.exit(1);
  }
  console.log(`OK: upsert de ${rows.length} ítems (count=${count ?? "n/a"}).`);
}

main();
