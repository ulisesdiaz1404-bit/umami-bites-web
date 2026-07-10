"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cart-store";
import { parseVariants } from "@/lib/data/menu-variants";
import type { MenuItem } from "@/lib/types/menu-item";

interface AddToCartButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  item: MenuItem;
  quantity?: number;
  label?: string;
}

export function AddToCartButton({
  item,
  quantity,
  label = "Agregar",
  size = "default",
  variant = "default",
  className,
  ...props
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  // Mínimo por ítem (ej. menús por persona: 20). Si no se pasa cantidad, se
  // agrega el mínimo (así "Reservar" arranca en 20 para los menús).
  const minQuantity = Number(item.metadata?.minQty) || 1;
  const qtyToAdd = quantity ?? minQuantity;

  // Si el ítem tiene variantes, agrega la primera (mismo id/nombre/precio que
  // el panel de detalle) para que card y detalle nunca difieran en el carrito.
  const firstVariant = parseVariants(item)?.[0];

  const handleAdd = () => {
    if (!item.available) return;
    addItem(
      {
        menuItemId: firstVariant ? `${item.id}__0` : item.id,
        slug: item.slug,
        name: firstVariant ? `${item.name} (${firstVariant.label})` : item.name,
        priceInCents: firstVariant?.priceInCents ?? item.priceInCents,
        imageUrl: item.images[0]?.url ?? "",
        maxQuantity: item.maxQuantity,
        minQuantity,
        category: item.category,
        type: item.type,
        unit: item.metadata?.unit,
      },
      qtyToAdd
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <Button
      onClick={handleAdd}
      disabled={!item.available}
      size={size}
      variant={variant}
      className={className}
      aria-label={item.available ? `Agregar ${item.name} al carrito` : "No disponible"}
      {...props}
    >
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
            {item.available ? (
              <>
                <Plus className="size-4" /> {label}
              </>
            ) : (
              "No disponible"
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
