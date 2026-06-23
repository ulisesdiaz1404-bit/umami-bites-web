import type { Metadata } from "next";
import { MenuGrid } from "@/components/menu/menu-grid";
import { Reveal } from "@/components/ui/reveal";
import { getAllItems, CATEGORIES } from "@/lib/data/menu";
import type { ItemType } from "@/lib/types/menu-item";

// ISR: refleja ediciones del admin sin redeploy.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Menú",
  description:
    "Picadas, empanadas, finger food, menús (asado, criolla, pizza party, sándwich a la parrilla), brunch, mesa dulce y carta de bebidas de Umami Bites.",
};

type TypeFilter = "all" | ItemType;

function parseType(value?: string): TypeFilter {
  return value === "dish" || value === "package" ? value : "all";
}

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const items = await getAllItems();

  return (
    <div className="mx-auto max-w-7xl px-5 pb-28 pt-32 lg:px-8">
      <Reveal>
        <span className="eyebrow">Nuestra carta</span>
        <h1 className="mt-5 max-w-3xl font-display text-4xl text-cream sm:text-5xl lg:text-6xl">
          Todo lo que <span className="accent-serif">ofrecemos</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-primary/85">
          Desde una picada para el encuentro de los viernes hasta un asado al asador para 100
          personas. Filtrá por tipo o categoría y armá tu pedido.
        </p>
      </Reveal>

      <div className="mt-12">
        <MenuGrid items={items} categories={CATEGORIES} initialType={parseType(tipo)} />
      </div>
    </div>
  );
}
