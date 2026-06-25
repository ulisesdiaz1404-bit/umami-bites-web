import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { PackageCard } from "@/components/menu/package-card";
import { Button } from "@/components/ui/button";
import { getFeaturedPackages } from "@/lib/data/menu";

export async function PackagesSection() {
  const packages = await getFeaturedPackages(4);

  return (
    <section className="relative overflow-hidden border-y border-line bg-bg-deep">
      <div className="grain absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-5 py-28 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow is-centered justify-center">Eventos sin estrés</span>
            <h2 className="mt-5 font-display text-4xl text-cream sm:text-5xl lg:text-6xl">
              Nuestros <span className="accent-serif">menús completos</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-primary/85">
              Menús pensados para tu evento (~20 personas): incluyen recepción, comida principal,
              bebida sin alcohol, vajilla, mantelería y servicio de mesa.
            </p>
          </div>
        </Reveal>

        <RevealGroup className="mt-16 grid gap-7 md:grid-cols-2" stagger={0.14}>
          {packages.map((pkg, i) => (
            <RevealItem key={pkg.id}>
              <PackageCard item={pkg} featured={i === 0} />
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.1}>
          <div className="mt-14 text-center">
            <Button asChild size="lg" variant="outline">
              <Link href="/menu?servicio=menus">
                Ver todos los menús <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
