import { MENU_ITEMS } from "../src/lib/data/mock-menu.ts";
import { writeFileSync } from "node:fs";

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const jsonb = (v: unknown) => (v == null ? "null" : `${q(JSON.stringify(v))}::jsonb`);
const num = (v: number | undefined) => (v == null ? "null" : String(v));

const rows = MENU_ITEMS.map((it, idx) => {
  return `  (${q(it.id)}, ${q(it.slug)}, ${q(it.name)}, ${q(it.description)}, ${it.priceInCents}, ${q(
    it.currency
  )}, ${jsonb(it.images)}, ${it.available}, ${it.maxQuantity}, ${q(it.category)}, ${q(
    it.type
  )}, ${num(it.servings)}, ${jsonb(it.includes ?? null)}, ${jsonb(it.metadata ?? null)}, ${idx})`;
});

const sql = `-- Seed del menú generado desde mock-menu.ts (scripts/gen-seed.ts).
-- Idempotente: upsert por id. Correr DESPUÉS de la migración 0001_init.sql.

insert into public.menu_items
  (id, slug, name, description, price_in_cents, currency, images, available, max_quantity, category, type, servings, includes, metadata, sort_order)
values
${rows.join(",\n")}
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price_in_cents = excluded.price_in_cents,
  currency = excluded.currency,
  images = excluded.images,
  available = excluded.available,
  max_quantity = excluded.max_quantity,
  category = excluded.category,
  type = excluded.type,
  servings = excluded.servings,
  includes = excluded.includes,
  metadata = excluded.metadata,
  sort_order = excluded.sort_order;
`;

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql, "utf8");
console.log(`Seed escrito: ${MENU_ITEMS.length} ítems → supabase/seed.sql`);
