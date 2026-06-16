"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MenuImage } from "@/lib/types/menu-item";

/** Galería del detalle: imagen principal + thumbnails. Si hay una sola, la muestra grande. */
export function ItemGallery({ images, unavailable }: { images: MenuImage[]; unavailable?: boolean }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="space-y-4">
      <motion.div
        key={active}
        initial={{ opacity: 0.4, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-surface"
      >
        {current && (
          <Image
            src={current.url}
            alt={current.alt}
            fill
            priority
            sizes="(max-width:1024px) 100vw, 50vw"
            className={cn("object-cover", unavailable && "grayscale")}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-deep/30 to-transparent" />
      </motion.div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "relative aspect-square w-20 overflow-hidden rounded-base border transition-all",
                i === active ? "border-accent ring-2 ring-accent/30" : "border-line opacity-70 hover:opacity-100"
              )}
            >
              <Image src={img.url} alt={img.alt} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
