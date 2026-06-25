"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { AddToCartButton } from "@/components/menu/add-to-cart-button";
import { formatUnit } from "@/lib/utils";
import type { MenuItem } from "@/lib/types/menu-item";

/** Panel de compra del detalle: selector de cantidad + agregar al carrito. */
export function ItemPurchase({ item }: { item: MenuItem }) {
  const minQty = Number(item.metadata?.minQty) || 1;
  const [qty, setQty] = useState(minQty);
  const unit = item.metadata?.unit;
  const dec = () => setQty((q) => Math.max(minQty, q - 1));
  const inc = () => setQty((q) => Math.min(item.maxQuantity, q + 1));

  if (!item.available) {
    return (
      <div className="rounded-lg border border-line bg-surface p-5 text-sm text-muted">
        Este ítem no está disponible por el momento. Escribinos por WhatsApp para consultar fechas.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
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

      <AddToCartButton item={item} quantity={qty} size="lg" label="Agregar al pedido" />

      <span className="text-xs text-muted">
        Hasta {item.maxQuantity} {formatUnit(item.maxQuantity, unit)} por pedido
      </span>
    </div>
  );
}
