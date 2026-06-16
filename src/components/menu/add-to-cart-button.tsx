"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cart-store";
import type { MenuItem } from "@/lib/types/menu-item";

interface AddToCartButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  item: MenuItem;
  quantity?: number;
  label?: string;
}

export function AddToCartButton({
  item,
  quantity = 1,
  label = "Agregar",
  size = "default",
  variant = "default",
  className,
  ...props
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!item.available) return;
    addItem(
      {
        menuItemId: item.id,
        slug: item.slug,
        name: item.name,
        priceInCents: item.priceInCents,
        imageUrl: item.images[0]?.url ?? "",
        maxQuantity: item.maxQuantity,
        type: item.type,
        unit: item.metadata?.unit,
      },
      quantity
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
