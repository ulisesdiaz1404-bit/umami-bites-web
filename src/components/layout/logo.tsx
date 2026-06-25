import Image from "next/image";
import { cn } from "@/lib/utils";

// Dimensiones reales del PNG (logo de marca con fondo transparente).
const LOGO_W = 517;
const LOGO_H = 496;

interface LogoProps {
  className?: string;
  /** Alto del logo en px (el ancho se calcula manteniendo la proporción). */
  mark?: number;
  /** Carga prioritaria (usar en el header, que está sobre el pliegue). */
  priority?: boolean;
}

/**
 * Logo oficial de Umami Bites Catering (PNG con fondo transparente).
 * El wordmark "Umami bites · Catering" ya viene dentro de la imagen.
 */
export function Logo({ className, mark = 48, priority = false }: LogoProps) {
  const height = mark;
  const width = Math.round(mark * (LOGO_W / LOGO_H));
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/logo.png"
        alt="Umami Bites Catering"
        width={width}
        height={height}
        priority={priority}
        className="shrink-0 object-contain"
        style={{ height, width }}
      />
    </span>
  );
}
