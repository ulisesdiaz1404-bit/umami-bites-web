"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "scale" | "fade";

const offset: Record<Direction, { x?: number; y?: number; scale?: number }> = {
  up: { y: 44 },
  down: { y: -44 },
  left: { x: -54 },
  right: { x: 54 },
  scale: { scale: 0.92 },
  fade: {},
};

interface RevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  once?: boolean;
}

/** Reveal scroll-triggered con Framer Motion. Respeta prefers-reduced-motion vía MotionConfig. */
export function Reveal({ children, direction = "up", delay = 0, className, once = true }: RevealProps) {
  const o = offset[direction];
  const variants: Variants = {
    hidden: { opacity: 0, x: o.x ?? 0, y: o.y ?? 0, scale: o.scale ?? 1 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: { duration: 0.85, delay, ease: [0.22, 0.8, 0.2, 1] },
    },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.15, margin: "0px 0px -8% 0px" }}
    >
      {children}
    </motion.div>
  );
}

/** Contenedor con stagger para listas/grids. Usar con <RevealItem>. */
export function RevealGroup({
  children,
  className,
  stagger = 0.1,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.1, margin: "0px 0px -8% 0px" }}
      variants={{ visible: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  direction?: Direction;
}) {
  const o = offset[direction];
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, x: o.x ?? 0, y: o.y ?? 0, scale: o.scale ?? 1 },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          transition: { duration: 0.7, ease: [0.22, 0.8, 0.2, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
