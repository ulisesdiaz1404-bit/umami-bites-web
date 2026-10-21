"use client";

import Link from "next/link";
import { createElement, isValidElement, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { animate, motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

// =====================================================================
// Kit visual del panel de administración. Todo con tokens de marca,
// así funciona igual en modo claro y oscuro.
// =====================================================================

export type ValueFormat = "money" | "number" | "percent" | "days";

export function formatValue(v: number, format: ValueFormat): string {
  switch (format) {
    case "money":
      return formatPrice(v, "ARS");
    case "percent":
      return `${v.toLocaleString("es-AR", { maximumFractionDigits: 1 })} %`;
    case "days":
      return `${v.toLocaleString("es-AR", { maximumFractionDigits: 1 })} días`;
    default:
      return Math.round(v).toLocaleString("es-AR");
  }
}

const ease = [0.22, 0.8, 0.2, 1] as const;

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
export const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

/** Contenedor que escalona la entrada de sus hijos <Item>. */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className={className}>
      {children}
    </motion.div>
  );
}
export function Item({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={rise} className={className}>
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="mb-8 flex flex-wrap items-end justify-between gap-4"
    >
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-sm text-muted first-letter:uppercase">{eyebrow}</p>}
        <h1 className="font-display text-3xl text-cream sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.header>
  );
}

// ---------------------------------------------------------------------

/** Número que sube animado hasta su valor (una vez, al entrar en pantalla). */
export function CountUp({ value, format }: { value: number; format: ValueFormat }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) return setShown(value);
    const controls = animate(0, value, { duration: 1.1, ease, onUpdate: setShown });
    return () => controls.stop();
  }, [inView, value, reduce]);

  return (
    <span ref={ref} className="tabular-nums">
      {formatValue(format === "money" ? Math.round(shown) : shown, format)}
    </span>
  );
}

export function Delta({ value, invert = false, suffix = "vs. mes anterior" }: { value: number | null; invert?: boolean; suffix?: string }) {
  if (value === null)
    return <span className="text-xs text-muted">Sin datos del período anterior</span>;
  const good = invert ? value < 0 : value > 0;
  const flat = value === 0;
  const Icon = flat ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 text-xs">
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold tabular-nums",
          flat ? "bg-surface-2 text-muted" : good ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
        )}
      >
        <Icon className="size-3.5" />
        {Math.abs(value).toLocaleString("es-AR", { maximumFractionDigits: 1 })} %
      </span>
      <span className="text-muted">{suffix}</span>
    </span>
  );
}

export function StatCard({
  label,
  value,
  format,
  icon,
  delta,
  invertDelta,
  hint,
  emphasis = false,
}: {
  label: string;
  value: number;
  format: ValueFormat;
  /** Componente de ícono (desde cliente) o el ícono ya renderizado (desde un Server Component). */
  icon: LucideIcon | ReactNode;
  delta?: number | null;
  invertDelta?: boolean;
  hint?: ReactNode;
  emphasis?: boolean;
}) {
  return (
    <motion.div
      variants={rise}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "group relative h-full overflow-hidden rounded-2xl border p-5 transition-shadow hover:shadow-soft",
        emphasis ? "border-accent/30 bg-accent/[0.07]" : "border-line bg-surface shadow-card"
      )}
    >
      {/* Brillo cálido que sigue al hover */}
      <span className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-accent/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span className="grid size-9 place-items-center rounded-xl bg-accent/12 text-accent">
          {isValidElement(icon) ? icon : createElement(icon as LucideIcon, { className: "size-[18px]" })}
        </span>
      </div>
      <p className="relative mt-3 text-[1.7rem] font-semibold leading-none tracking-tight text-cream">
        <CountUp value={value} format={format} />
      </p>
      <div className="relative mt-3 min-h-5">
        {delta !== undefined ? <Delta value={delta} invert={invertDelta} /> : hint ? <span className="text-xs text-muted">{hint}</span> : null}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------

export function Panel({
  title,
  description,
  action,
  children,
  className,
  icon: Icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  icon?: LucideIcon;
}) {
  return (
    <motion.section
      variants={rise}
      className={cn("rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6", className)}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-display text-lg text-cream">
            {Icon && <Icon className="size-4 text-accent" />}
            {title}
          </h2>
          {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  );
}

export function PanelLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="shrink-0 text-xs font-medium text-accent underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}

export function EmptyState({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong px-6 py-10 text-center">
      <span className="grid size-11 place-items-center rounded-2xl bg-accent/12 text-accent">
        <Icon className="size-5" />
      </span>
      <p className="mt-3 text-sm font-medium text-cream">{title}</p>
      {children && <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted">{children}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------

/** Barras horizontales con valor; las barras crecen al entrar en pantalla. */
export function BarList({
  items,
  format,
}: {
  items: { label: string; value: number; sub?: string }[];
  format: ValueFormat;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="space-y-3">
      {items.map((it, i) => (
        <li key={it.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-primary" title={it.label}>
              {it.label}
            </span>
            <span className="shrink-0 font-medium tabular-nums text-cream">
              {formatValue(it.value, format)}
              {it.sub && <span className="ml-1.5 text-xs font-normal text-muted">{it.sub}</span>}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-bg-deep">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(it.value / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.06, ease }}
              className="h-full rounded-full bg-gradient-to-r from-accent-deep to-accent"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------

/**
 * Gráfico de área (facturación diaria) con línea del período anterior
 * punteada, guía y tooltip al pasar el mouse / tocar. SVG puro.
 */
export function AreaChart({
  data,
}: {
  data: { day: string; revenue: number; orders: number; prevRevenue: number }[];
}) {
  const gid = useId().replace(/:/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [hover, setHover] = useState<number | null>(null);
  const W = 720;
  const H = 220;
  const PAD = { t: 12, r: 8, b: 26, l: 8 };

  const { line, area, prevLine, points, max, ticks } = useMemo(() => {
    const max = Math.max(1, ...data.map((d) => Math.max(d.revenue, d.prevRevenue))) * 1.12;
    const x = (i: number) => PAD.l + (i / Math.max(1, data.length - 1)) * (W - PAD.l - PAD.r);
    const y = (v: number) => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b);
    const pts = data.map((d, i) => [x(i), y(d.revenue)] as const);
    const prev = data.map((d, i) => [x(i), y(d.prevRevenue)] as const);
    // Curva suave (Catmull-Rom → Bézier), sin pasarse por debajo de 0.
    const smooth = (p: readonly (readonly [number, number])[]) =>
      p.reduce((acc, [px, py], i, arr) => {
        if (i === 0) return `M${px},${py}`;
        const [x0, y0] = arr[i - 2] ?? arr[i - 1]!;
        const [x1, y1] = arr[i - 1]!;
        const [x3, y3] = arr[i + 1] ?? [px, py];
        const base = H - PAD.b;
        const c1 = [x1 + (px - x0) / 6, Math.min(base, y1 + (py - y0) / 6)];
        const c2 = [px - (x3 - x1) / 6, Math.min(base, py - (y3 - y1) / 6)];
        return `${acc} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${px},${py}`;
      }, "");
    const line = smooth(pts);
    const area = `${line} L${x(data.length - 1)},${H - PAD.b} L${x(0)},${H - PAD.b} Z`;
    const ticks = [0, Math.floor(data.length / 3), Math.floor((2 * data.length) / 3), data.length - 1];
    return { line, area, prevLine: smooth(prev), points: pts, max, ticks };
  }, [data]);

  const fmtDay = (k: string) =>
    new Date(`${k}T12:00:00Z`).toLocaleDateString("es-AR", { day: "numeric", month: "short", timeZone: "UTC" });

  const onMove = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const rel = ((clientX - r.left) / r.width) * W;
    const i = Math.round(((rel - PAD.l) / (W - PAD.l - PAD.r)) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };

  const h = hover !== null ? data[hover] : null;
  const hp = hover !== null ? points[hover] : null;

  return (
    <div
      ref={ref}
      className="relative h-full min-h-56 select-none"
      onMouseMove={(e) => onMove(e.clientX)}
      onMouseLeave={() => setHover(null)}
      onTouchMove={(e) => e.touches[0] && onMove(e.touches[0].clientX)}
      onTouchEnd={() => setHover(null)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" role="img" aria-label="Facturación diaria de los últimos 30 días">
        <defs>
          <linearGradient id={`fill-${gid}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + f * (H - PAD.t - PAD.b)} y2={PAD.t + f * (H - PAD.t - PAD.b)} stroke="var(--color-line)" strokeDasharray="2 6" vectorEffect="non-scaling-stroke" />
        ))}
        <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="var(--color-line-strong)" vectorEffect="non-scaling-stroke" />

        <motion.path
          d={prevLine}
          fill="none"
          stroke="var(--color-muted)"
          strokeOpacity={0.45}
          strokeWidth={1.5}
          strokeDasharray="4 5"
          vectorEffect="non-scaling-stroke"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        />
        <motion.path
          d={area}
          fill={`url(#fill-${gid})`}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.4 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={2.25}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.4, ease }}
        />

        {hp && (
          <>
            <line x1={hp[0]} x2={hp[0]} y1={PAD.t} y2={H - PAD.b} stroke="var(--color-accent)" strokeOpacity={0.35} vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>

      {/* Punto activo (HTML, para que no se deforme con preserveAspectRatio) */}
      {hp && (
        <span
          className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-accent shadow"
          style={{ left: `${(hp[0] / W) * 100}%`, top: `${(hp[1] / H) * 100}%` }}
        />
      )}

      {/* Eje X */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 text-[11px] text-muted">
        {ticks.map((i) => (
          <span
            key={i}
            className="absolute -translate-x-1/2 whitespace-nowrap first:translate-x-0 last:-translate-x-full"
            style={{ left: `${(points[i]![0] / W) * 100}%` }}
          >
            {fmtDay(data[i]!.day)}
          </span>
        ))}
      </div>

      {h && hp && (
        <div
          className="pointer-events-none absolute top-0 z-10 w-44 rounded-xl border border-line bg-surface/95 p-3 text-xs shadow-soft backdrop-blur"
          style={{
            left: `${(hp[0] / W) * 100}%`,
            transform: `translateX(${hp[0] / W > 0.6 ? "calc(-100% - 12px)" : "12px"})`,
          }}
        >
          <p className="font-medium text-cream first-letter:uppercase">
            {new Date(`${h.day}T12:00:00Z`).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "short", timeZone: "UTC" })}
          </p>
          <p className="mt-1.5 flex justify-between gap-2">
            <span className="text-muted">Facturado</span>
            <span className="font-semibold tabular-nums text-cream">{formatPrice(h.revenue, "ARS")}</span>
          </p>
          <p className="flex justify-between gap-2">
            <span className="text-muted">Pedidos</span>
            <span className="tabular-nums text-cream">{h.orders}</span>
          </p>
          <p className="mt-1 flex justify-between gap-2 border-t border-line pt-1">
            <span className="text-muted">30 días antes</span>
            <span className="tabular-nums text-muted">{formatPrice(h.prevRevenue, "ARS")}</span>
          </p>
        </div>
      )}
      <span className="sr-only">Máximo del período: {formatPrice(Math.round(max / 1.12), "ARS")}</span>
    </div>
  );
}
