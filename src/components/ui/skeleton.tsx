import { cn } from "@/lib/utils";

/** Skeleton con la paleta oscura de Umami Bites (clase .skeleton en globals.css). */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}
