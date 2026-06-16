"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { PackageCard } from "@/components/menu/package-card";
import { cn } from "@/lib/utils";
import type { ItemType, MenuItem } from "@/lib/types/menu-item";

type TypeFilter = "all" | ItemType;

const TYPE_TABS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "dish", label: "Platos" },
  { value: "package", label: "Paquetes" },
];

interface MenuGridProps {
  items: MenuItem[];
  categories: readonly string[];
  initialType?: TypeFilter;
}

export function MenuGrid({ items, categories, initialType = "all" }: MenuGridProps) {
  const [type, setType] = useState<TypeFilter>(initialType);
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(
    () =>
      items.filter(
        (i) => (type === "all" || i.type === type) && (category === "all" || i.category === category)
      ),
    [items, type, category]
  );

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Toggle por tipo */}
        <div
          role="tablist"
          aria-label="Filtrar por tipo"
          className="inline-flex rounded-full border border-line bg-surface p-1"
        >
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={type === tab.value}
              onClick={() => setType(tab.value)}
              className={cn(
                "relative rounded-full px-5 py-2 text-sm font-medium transition-colors",
                type === tab.value ? "text-on-accent" : "text-primary/80 hover:text-cream"
              )}
            >
              {type === tab.value && (
                <motion.span
                  layoutId="type-pill"
                  className="absolute inset-0 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dropdown por categoría */}
        <div className="relative inline-flex items-center">
          <label htmlFor="category-filter" className="sr-only">
            Filtrar por categoría
          </label>
          <select
            id="category-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 cursor-pointer appearance-none rounded-full border border-line bg-surface pl-5 pr-11 text-sm text-primary transition-colors hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 size-4 text-muted" />
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">
        {filtered.length} {filtered.length === 1 ? "opción" : "opciones"}
      </p>

      <AnimatePresence mode="popLayout">
        <motion.div
          layout
          className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.22, 0.8, 0.2, 1] }}
            >
              {item.type === "package" ? (
                <PackageCard item={item} />
              ) : (
                <MenuItemCard item={item} />
              )}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="mt-16 text-center">
          <p className="font-display text-xl text-cream">Sin resultados</p>
          <p className="mt-2 text-sm text-muted">Probá con otra categoría o tipo.</p>
        </div>
      )}
    </div>
  );
}
