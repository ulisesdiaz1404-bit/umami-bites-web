import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Tamaño del isotipo (ring + monograma) en px. */
  mark?: number;
  /** Muestra el wordmark "Umami Bites / Catering" al lado. */
  withText?: boolean;
  /** Anima la rotación lenta del anillo botánico. */
  animated?: boolean;
}

/**
 * Isologo de Umami Bites: anillo con detalle botánico + monograma UB,
 * inspirado en el logo de marca. SVG inline (escala sin pérdida, hereda color).
 */
export function Logo({ className, mark = 44, withText = true, animated = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <svg
        width={mark}
        height={mark}
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden
        className="shrink-0 text-primary"
      >
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeOpacity="0.85"
          className={animated ? "spin-slow origin-center" : undefined}
        />
        {/* rama botánica */}
        <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.9">
          <path d="M16 16 C30 26, 40 30, 50 28" fill="none" />
          <path d="M16 16 C22 22, 26 30, 26 38" fill="none" />
          <path d="M22 19 C28 17, 33 18, 36 22" fill="none" />
          <path d="M28 24 C34 23, 39 25, 41 29" fill="none" />
          <path d="M20 24 C19 30, 21 35, 25 38" fill="none" />
        </g>
        {/* monograma UB */}
        <text
          x="50"
          y="62"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="40"
          fontWeight="600"
          fill="currentColor"
          letterSpacing="-1"
        >
          UB
        </text>
        {/* puntos decorativos */}
        <g fill="currentColor" fillOpacity="0.8">
          <circle cx="74" cy="80" r="1.6" />
          <circle cx="80" cy="74" r="1.2" />
          <circle cx="68" cy="84" r="1.1" />
        </g>
      </svg>
      {withText && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg tracking-tight text-cream">Umami Bites</span>
          <span className="text-[0.6rem] font-medium uppercase tracking-[0.42em] text-accent">
            Catering
          </span>
        </span>
      )}
    </span>
  );
}
