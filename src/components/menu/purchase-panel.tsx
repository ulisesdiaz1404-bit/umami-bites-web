"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cart-store";
import { cn, formatPrice, formatUnit } from "@/lib/utils";
import type { MenuItem } from "@/lib/types/menu-item";

interface Variant {
  label: string;
  priceInCents: number;
}

/** Lee las variantes (opciones) de metadata.variants (JSON). */
function parseVariants(item: MenuItem): Variant[] | null {
  const raw = item.metadata?.variants;
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) && v.length > 0 ? (v as Variant[]) : null;
  } catch {
    return null;
  }
}

/**
 * Panel de compra del detalle: precio, selector de opción (si el ítem tiene
 * variantes, ej. picadas o bebidas con dos tamaños), cantidad y agregar al
 * carrito. El precio se actualiza según la opción elegida.
 */
export function PurchasePanel({ item }: { item: MenuItem }) {
  const variants = parseVariants(item);
  const minQty = Number(item.metadata?.minQty) || 1;
  const unit = item.metadata?.unit;
  const addItem = useCartStore((s) => s.addItem);

  const [variantIdx, setVariantIdx] = useState(0);
  const [qty, setQty] = useState(minQty);
  const [added, setAdded] = useState(false);

  const current = variants?.[variantIdx];
  const price = current?.priceInCents ?? item.priceInCents;
  const variantLabel = current?.label;
  const name = variantLabel ? `${item.name} (${variantLabel})` : item.name;

  const dec = () => setQty((q) => Math.max(minQty, q - 1));
  const inc = () => setQty((q) => Math.min(item.maxQuantity, q + 1));

  const handleAdd = () => {
    if (!item.available) return;
    addItem(
      {
        menuItemId: variants ? `${item.id}__${variantIdx}` : item.id,
        slug: item.slug,
        name,
        priceInCents: price,
        imageUrl: item.images[0]?.url ?? "",
        maxQuantity: item.maxQuantity,
        minQuantity: minQty,
        category: item.category,
        type: item.type,
        unit,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div>
      {/* Precio */}
      <div className="flex items-end gap-2">
        <span className="price text-4xl">{formatPrice(price, item.currency)}</span>
        {unit && <span className="pb-1 text-sm text-muted">/ {unit}</span>}
      </div>
      {minQty > 1 && (
        <p className="mt-1.5 text-sm text-muted">
          Mínimo {minQty} personas · total desde{" "}
          <span className="font-semibold text-primary">{formatPrice(price * minQty, item.currency)}</span>
        </p>
      )}

      {/* Selector de opción */}
      {variants && (
        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">Elegí tu opción</p>
          <div className="mt-2.5 flex flex-wrap gap-2.5">
            {variants.map((v, i) => {
              const selected = i === variantIdx;
              return (
                <button
                  key={v.label}
                  type="button"
                  onClick={() => setVariantIdx(i)}
                  aria-pressed={selected}
                  className={cn(
                    "flex flex-col items-start gap-0.5 rounded-base border px-4 py-2.5 text-left transition-all",
                    selected
                      ? "border-accent bg-accent/10 shadow-glow"
                      : "border-line bg-bg-deep hover:border-line-strong"
                  )}
                >
                  <span className={cn("text-sm font-medium", selected ? "text-cream" : "text-primary")}>
                    {v.label}
                  </span>
                  <span className="price text-base">{formatPrice(v.priceInCents, item.currency)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Cantidad + agregar */}
      {item.available ? (
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center rounded-full border border-line bg-surface">
            <button
              type="button"
              onClick={dec}
              disabled={qty <= minQty}
              aria-label="Restar"
              className="grid h-12 w-12 place-items-center rounded-full text-primary transition-colors hover:bg-surface-2 disabled:opacity-35"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-12 text-center font-display text-lg tabular-nums text-cream">{qty}</span>
            <button
              type="button"
              onClick={inc}
              disabled={qty >= item.maxQuantity}
              aria-label="Sumar"
              className="grid h-12 w-12 place-items-center rounded-full text-primary transition-colors hover:bg-surface-2 disabled:opacity-35"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <Button onClick={handleAdd} size="lg">
            <AnimatePresence mode="wait" initial={false}>
              {added ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="inline-flex items-center gap-2"
                >
                  <Check className="size-4" /> Agregado
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="inline-flex items-center gap-2"
                >
                  <Plus className="size-4" /> Agregar al pedido
                </motion.span>
              )}
            </AnimatePresence>
          </Button>

          <span className="text-xs text-muted">
            Hasta {item.maxQuantity} {formatUnit(item.maxQuantity, unit)} por pedido
          </span>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-line bg-surface p-5 text-sm text-muted">
          Este ítem no está disponible por el momento. Escribinos por WhatsApp para consultar fechas.
        </div>
      )}
    </div>
  );
}
