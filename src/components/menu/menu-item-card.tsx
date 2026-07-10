"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/menu/add-to-cart-button";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { displayPriceInCents } from "@/lib/data/menu-variants";
import type { MenuItem } from "@/lib/types/menu-item";

/** Card para plato individual (type: "dish"). */
export function MenuItemCard({ item }: { item: MenuItem }) {
  const unit = item.metadata?.unit;
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-card transition-shadow hover:shadow-soft",
        !item.available && "opacity-80"
      )}
    >
      <Link href={`/menu/${item.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={item.images[0]?.url ?? ""}
          alt={item.images[0]?.alt ?? item.name}
          fill
          sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
          className={cn(
            "object-cover transition-transform duration-700 group-hover:scale-105",
            !item.available && "grayscale"
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80" />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge variant="neutral">{item.category}</Badge>
        </div>
        {!item.available && (
          <div className="absolute right-3 top-3">
            <Badge variant="danger">No disponible</Badge>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/menu/${item.slug}`}>
          <h3 className="font-display text-lg leading-snug text-cream transition-colors group-hover:text-accent">
            {item.name}
          </h3>
        </Link>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-primary/90">{item.description}</p>

        <div className="mt-4 flex items-end justify-between gap-3 pt-2">
          <div>
            <span className="price text-xl">
              {formatPrice(displayPriceInCents(item), item.currency)}
            </span>
            {unit && <span className="ml-1 text-xs text-muted">/ {unit}</span>}
          </div>
          <AddToCartButton item={item} size="sm" />
        </div>
      </div>
    </motion.article>
  );
}
