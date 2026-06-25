import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ItemGallery } from "@/components/menu/item-gallery";
import { PurchasePanel } from "@/components/menu/purchase-panel";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { PackageCard } from "@/components/menu/package-card";
import { Reveal } from "@/components/ui/reveal";
import { getAllItems, getItemBySlug, getRelatedItems } from "@/lib/data/menu";

// ISR + slugs nuevos a demanda (ítems agregados desde el admin).
export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getAllItems()).map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getItemBySlug(slug);
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
  const item = await getItemBySlug(slug);
  if (!item) notFound();

  const related = await getRelatedItems(item);
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

          {!item.metadata?.variants &&
            (() => {
              const label =
                item.metadata?.tagline ??
                (item.metadata?.unit === "persona"
                  ? "Precio por persona"
                  : item.servings && item.servings > 1
                    ? `Pensado para ${item.servings} personas`
                    : null);
              return label ? (
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-primary/85">
                  <Users className="size-4 text-accent" />
                  {label}
                </p>
              ) : null;
            })()}

          <div className="mt-5">
            <PurchasePanel item={item} />
          </div>

          <p className="mt-7 leading-relaxed text-primary/85">{item.description}</p>

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
