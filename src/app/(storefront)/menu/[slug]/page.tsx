import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ItemGallery } from "@/components/menu/item-gallery";
import { ItemPurchase } from "@/components/menu/item-purchase";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { PackageCard } from "@/components/menu/package-card";
import { Reveal } from "@/components/ui/reveal";
import { getAllItems, getItemBySlug, getRelatedItems } from "@/lib/data/mock-menu";
import { formatPrice } from "@/lib/utils";

export function generateStaticParams() {
  return getAllItems().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getItemBySlug(slug);
  if (!item) return { title: "No encontrado" };
  return {
    title: item.name,
    description: item.description.slice(0, 155),
    openGraph: { images: item.images.map((i) => i.url) },
  };
}

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getItemBySlug(slug);
  if (!item) notFound();

  const related = getRelatedItems(item);
  const unit = item.metadata?.unit;
  const incluye = item.metadata?.incluye;

  return (
    <div className="mx-auto max-w-7xl px-5 pb-28 pt-28 lg:px-8">
      <Link
        href="/menu"
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-cream"
      >
        <ArrowLeft className="size-4" /> Volver al menú
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <Reveal direction="left">
          <ItemGallery images={item.images} unavailable={!item.available} />
        </Reveal>

        <Reveal direction="right">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={item.type === "package" ? "soft" : "neutral"}>
              {item.type === "package" ? "Paquete" : "Plato"}
            </Badge>
            <Badge variant="outline">{item.category}</Badge>
            {!item.available && <Badge variant="danger">No disponible</Badge>}
          </div>

          <h1 className="mt-4 font-display text-4xl leading-tight text-cream lg:text-5xl">
            {item.name}
          </h1>

          {item.servings && (
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-primary/85">
              <Users className="size-4 text-accent" />
              {item.metadata?.tagline ?? `Pensado para ${item.servings} personas`}
            </p>
          )}

          <div className="mt-5 flex items-end gap-2">
            <span className="font-display text-4xl text-accent">
              {formatPrice(item.priceInCents, item.currency)}
            </span>
            {unit && <span className="pb-1 text-sm text-muted">/ {unit}</span>}
          </div>
          {item.metadata?.tierMayor && (
            <p className="mt-1 text-sm text-muted">Opción mayor: {item.metadata.tierMayor}</p>
          )}

          <p className="mt-6 leading-relaxed text-primary/85">{item.description}</p>

          {item.includes && item.includes.length > 0 && (
            <div className="mt-7">
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                Qué incluye
              </h2>
              <ul className="mt-3 space-y-2">
                {item.includes.map((inc) => (
                  <li key={inc} className="flex gap-2.5 text-sm text-primary/90">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {incluye && (
            <p className="mt-5 rounded-base border border-line bg-surface p-4 text-xs leading-relaxed text-muted">
              Cada menú incluye: {incluye}.
            </p>
          )}

          <Separator className="my-7" />
          <ItemPurchase item={item} />
        </Reveal>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <Reveal>
            <h2 className="font-display text-2xl text-cream sm:text-3xl">
              También de <span className="accent-serif">{item.category}</span>
            </h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((rel) =>
              rel.type === "package" ? (
                <PackageCard key={rel.id} item={rel} />
              ) : (
                <MenuItemCard key={rel.id} item={rel} />
              )
            )}
          </div>
        </section>
      )}
    </div>
  );
}
