"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/stores/cart-store";
import { formatPrice, formatUnit } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/lib/types/cart";

export function CartItem({ item }: { item: CartItemType }) {
  const { increment, decrement, removeItem } = useCartStore();
  const minQty = item.minQuantity ?? 1;
  const atMax = item.quantity >= item.maxQuantity;
  const atMin = item.quantity <= minQty;

  return (
    <div className="flex gap-4 py-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-base border border-line bg-bg-deep">
        <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant={item.type === "package" ? "soft" : "neutral"}>
                {item.type === "package" ? "Paquete" : "Plato"}
              </Badge>
            </div>
            <p className="mt-1 truncate font-display text-base text-cream">{item.name}</p>
            <p className="text-xs text-muted">
              {formatPrice(item.priceInCents, "ARS")} · {formatUnit(item.quantity, item.unit)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.menuItemId)}
            aria-label={`Quitar ${item.name}`}
            className="rounded-full p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-danger"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="inline-flex items-center rounded-full border border-line">
            <button
              type="button"
              onClick={() => decrement(item.menuItemId)}
              disabled={atMin}
              aria-label="Restar uno"
              className="grid h-8 w-8 place-items-center rounded-full text-primary transition-colors hover:bg-surface-2 disabled:opacity-35"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-medium tabular-nums text-cream">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => increment(item.menuItemId)}
              disabled={atMax}
              aria-label="Sumar uno"
              className="grid h-8 w-8 place-items-center rounded-full text-primary transition-colors hover:bg-surface-2 disabled:opacity-35"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <span className="font-display text-base text-accent">
            {formatPrice(item.priceInCents * item.quantity, "ARS")}
          </span>
        </div>
        {atMax ? (
          <p className="pt-1 text-[0.7rem] text-muted">Máximo {item.maxQuantity} por pedido</p>
        ) : minQty > 1 && atMin ? (
          <p className="pt-1 text-[0.7rem] text-muted">Mínimo {minQty} personas</p>
        ) : null}
      </div>
    </div>
  );
}
