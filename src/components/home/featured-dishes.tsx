import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { Button } from "@/components/ui/button";
import { getFeaturedDishes } from "@/lib/data/menu";

export async function FeaturedDishes() {
  const dishes = await getFeaturedDishes(4);

  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="eyebrow">Para picar y compartir</span>
            <h2 className="mt-5 max-w-xl font-display text-3xl text-cream sm:text-4xl lg:text-5xl">
              Platos <span className="accent-serif">destacados</span>
            </h2>
          </div>
          <Button asChild variant="link" className="px-0">
            <Link href="/menu?tipo=dish">
              Ver todos los platos <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </Reveal>

      <RevealGroup
        className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        stagger={0.12}
      >
        {dishes.map((dish) => (
          <RevealItem key={dish.id}>
            <MenuItemCard item={dish} />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
