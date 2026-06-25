import type { Metadata } from "next";
import { MenuGrid } from "@/components/menu/menu-grid";
import type { GroupFilter } from "@/components/menu/menu-grid";
import { Reveal } from "@/components/ui/reveal";
import { getAllItems, CATEGORIES } from "@/lib/data/menu";

// ISR: refleja ediciones del admin sin redeploy.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Nuestros servicios de catering: picadas y complementos (tablas, empanadas, finger food, mesa dulce, bebidas) y menús completos para eventos (asado, criolla, pizza party, sándwich a la parrilla, brunch).",
};

function parseGroup(value?: string): GroupFilter {
  if (value === "complementos") return "Picadas y complementos";
  if (value === "menus") return "Menús";
  return "all";
}

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ servicio?: string }>;
}) {
  const { servicio } = await searchParams;
  const items = await getAllItems();

  return (
    <div className="mx-auto max-w-7xl px-5 pb-28 pt-32 lg:px-8">
      <Reveal>
        <span className="eyebrow">Nuestros servicios</span>
        <h1 className="mt-5 max-w-3xl font-display text-4xl text-cream sm:text-5xl lg:text-6xl">
          Todo lo que <span className="accent-serif">ofrecemos</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-primary/85">
          Desde una picada para el encuentro de los viernes hasta un menú completo para tu evento.
          Elegí entre <strong className="text-primary">picadas y complementos</strong> o nuestros{" "}
          <strong className="text-primary">menús</strong> para ~20 personas y armá tu pedido.
        </p>
      </Reveal>

      <div className="mt-12">
        <MenuGrid items={items} categories={CATEGORIES} initialGroup={parseGroup(servicio)} />
      </div>
    </div>
  );
}
