"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/menu/add-to-cart-button";
import { cn, formatPrice } from "@/lib/utils";
import type { MenuItem } from "@/lib/types/menu-item";

/** Card para paquete / menú (type: "package"), con lista de incluidos expandible. */
export function PackageCard({ item, featured = false }: { item: MenuItem; featured?: boolean }) {
  const [open, setOpen] = useState(false);
  const isSpecialty = item.metadata?.especialidad === "true";
  const unit = item.metadata?.unit;
  const tagline = item.metadata?.tagline;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-surface shadow-card transition-shadow hover:shadow-soft",
        featured || isSpecialty ? "border-accent/40" : "border-line",
        !item.available && "opacity-80"
      )}
    >
      <Link
        href={`/menu/${item.slug}`}
        className={cn("relative block overflow-hidden", featured ? "aspect-[16/10]" : "aspect-[4/3]")}
      >
        <Image
          src={item.images[0]?.url ?? ""}
          alt={item.images[0]?.alt ?? item.name}
          fill
          sizes="(max-width:768px) 100vw, 50vw"
          className={cn(
            "object-cover transition-transform duration-700 group-hover:scale-105",
            !item.available && "grayscale"
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge variant="soft">Paquete</Badge>
          {isSpecialty && (
            <Badge variant="default" className="gap-1">
              <Sparkles className="size-3" /> Especialidad
            </Badge>
          )}
        </div>
        {!item.available && (
          <div className="absolute right-4 top-4">
            <Badge variant="danger">No disponible</Badge>
          </div>
        )}
        {item.servings && (
          <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-xs text-white backdrop-blur-sm">
            <Users className="size-3.5 text-accent" />
            {tagline ?? `Para ${item.servings} personas`}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5 lg:p-6">
        <Link href={`/menu/${item.slug}`}>
          <h3 className="font-display text-xl leading-snug text-cream transition-colors group-hover:text-accent lg:text-2xl">
            {item.name}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{item.description}</p>

        {item.includes && item.includes.length > 0 && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-accent transition-colors hover:text-cream"
            >
              ¿Qué incluye?
              <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <li className="h-2" aria-hidden />
                  {item.includes.map((inc) => (
                    <li key={inc} className="flex gap-2 py-1 text-sm text-primary/85">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-accent" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
          <div>
            <span className="font-display text-2xl text-accent">
              {formatPrice(item.priceInCents, item.currency)}
            </span>
            {unit && <span className="ml-1 text-xs text-muted">/ {unit}</span>}
          </div>
          <AddToCartButton item={item} label="Reservar" />
        </div>
      </div>
    </motion.article>
  );
}
