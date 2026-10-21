"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import { ChevronsLeft, Menu, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// =====================================================================
// Shell de dashboard con menú lateral colapsable.
// Basado en "dashboard-with-collapsible-sidebar" (21st.dev), reescrito:
// - tipado, navegación real con <Link> y estado activo por ruta,
// - tokens de marca (bg/surface/accent) → funciona en modo claro y oscuro,
// - ancho animado con spring, indicador activo que se desliza (layoutId),
// - tooltips y badges en modo colapsado, atajo Ctrl/⌘ + B,
// - drawer en mobile, estado recordado en cookie (sin salto al cargar).
// =====================================================================

export interface SidebarNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Número a mostrar (0 o undefined = sin badge). */
  badge?: number;
  badgeTone?: "accent" | "danger";
  /** Solo activo con la ruta exacta (para la home del panel). */
  exact?: boolean;
  external?: boolean;
}

export interface SidebarNavGroup {
  label: string;
  items: SidebarNavItem[];
}

interface DashboardShellProps {
  groups: SidebarNavGroup[];
  /** Logo/marca: recibe si el menú está abierto para adaptar el contenido. */
  brand: (open: boolean) => ReactNode;
  /** Pie del menú (usuario, tema, salir). */
  footer?: (open: boolean) => ReactNode;
  /** Estado inicial (leído de la cookie en el servidor). */
  defaultOpen?: boolean;
  cookieName?: string;
  /** Contenido arriba del main (ej. banner). */
  banner?: ReactNode;
  children: ReactNode;
}

const OPEN_W = 272;
const CLOSED_W = 76;
const spring = { type: "spring", stiffness: 380, damping: 36, mass: 0.8 } as const;

export function DashboardShell({
  groups,
  brand,
  footer,
  defaultOpen = true,
  cookieName = "sidebar-open",
  banner,
  children,
}: DashboardShellProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const toggle = useCallback(() => {
    setOpen((v) => {
      const next = !v;
      document.cookie = `${cookieName}=${next ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
      return next;
    });
  }, [cookieName]);

  // Atajo de teclado: Ctrl/⌘ + B
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  useEffect(() => setMobileOpen(false), [pathname]);

  const totalAlerts = groups
    .flatMap((g) => g.items)
    .reduce((s, i) => s + (i.badge && i.badgeTone === "danger" ? i.badge : 0), 0);

  return (
    <div className="flex min-h-dvh w-full bg-bg text-primary">
      {/* ---------------- Desktop ---------------- */}
      <motion.aside
        initial={false}
        animate={{ width: open ? OPEN_W : CLOSED_W }}
        transition={spring}
        className="sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-surface lg:flex print:hidden"
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div className="border-b border-line px-3 py-4">{brand(open)}</div>
          <SidebarNav groups={groups} open={open} pathname={pathname} layoutId="active-desktop" />
          {footer && <div className="border-t border-line p-3">{footer(open)}</div>}
          <button
            type="button"
            onClick={toggle}
            title={open ? "Contraer menú (Ctrl+B)" : "Expandir menú (Ctrl+B)"}
            aria-label={open ? "Contraer menú" : "Expandir menú"}
            className="group flex h-12 items-center gap-3 border-t border-line px-[26px] text-sm text-muted transition-colors hover:bg-surface-2 hover:text-cream"
          >
            <motion.span animate={{ rotate: open ? 0 : 180 }} transition={spring} className="grid place-items-center">
              <ChevronsLeft className="size-4" />
            </motion.span>
            <AnimatePresence initial={false}>
              {open && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15 }}
                  className="whitespace-nowrap"
                >
                  Contraer
                  <kbd className="ml-2 rounded border border-line px-1.5 py-0.5 font-body text-[10px] text-muted">Ctrl B</kbd>
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* ---------------- Mobile: barra superior + drawer ---------------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface/90 px-4 py-2.5 backdrop-blur-xl lg:hidden print:hidden">
          {brand(true)}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            className="relative grid size-11 place-items-center rounded-xl text-primary hover:bg-surface-2"
          >
            <Menu className="size-5" />
            {totalAlerts > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-danger" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={spring}
                className="fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-[300px] flex-col border-r border-line bg-surface shadow-soft lg:hidden"
              >
                <div className="flex items-center justify-between border-b border-line px-3 py-4">
                  {brand(true)}
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Cerrar menú"
                    className="grid size-10 place-items-center rounded-xl text-muted hover:bg-surface-2"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <SidebarNav groups={groups} open pathname={pathname} layoutId="active-mobile" />
                {footer && <div className="border-t border-line p-3">{footer(true)}</div>}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="print:hidden">{banner}</div>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

function SidebarNav({
  groups,
  open,
  pathname,
  layoutId,
}: {
  groups: SidebarNavGroup[];
  open: boolean;
  pathname: string;
  layoutId: string;
}) {
  return (
    <LayoutGroup id={layoutId}>
      <nav className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 py-4">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="h-6 px-3">
              <AnimatePresence initial={false}>
                {open ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="whitespace-nowrap text-[11px] font-medium text-muted/80"
                  >
                    {group.label}
                  </motion.p>
                ) : (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 block h-px w-6 bg-line"
                  />
                )}
              </AnimatePresence>
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavLink item={item} open={open} pathname={pathname} layoutId={layoutId} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </LayoutGroup>
  );
}

function NavLink({
  item,
  open,
  pathname,
  layoutId,
}: {
  item: SidebarNavItem;
  open: boolean;
  pathname: string;
  layoutId: string;
}) {
  const active = !item.external && (item.exact ? pathname === item.href : pathname.startsWith(item.href));
  const Icon = item.icon;
  // Tooltip en posición fija: así no lo recorta el overflow del menú.
  const ref = useRef<HTMLAnchorElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const showTip = () => {
    if (open || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setTip({ x: r.right + 12, y: r.top + r.height / 2 });
  };
  const hasBadge = Boolean(item.badge && item.badge > 0);
  const badgeClass =
    item.badgeTone === "danger" ? "bg-danger text-white" : "bg-accent text-on-accent";

  return (
    <Link
      ref={ref}
      onMouseEnter={showTip}
      onMouseLeave={() => setTip(null)}
      onFocus={showTip}
      onBlur={() => setTip(null)}
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-11 items-center rounded-xl text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/50",
        active ? "text-cream" : "text-muted hover:text-cream"
      )}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          transition={spring}
          className="absolute inset-0 rounded-xl border border-accent/25 bg-accent/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        >
          <span className="absolute inset-y-2.5 left-0 w-[3px] rounded-r-full bg-accent" />
        </motion.span>
      )}
      {!active && (
        <span className="absolute inset-0 rounded-xl bg-surface-2 opacity-0 transition-opacity group-hover:opacity-100" />
      )}

      <span className="relative grid h-full w-[52px] shrink-0 place-items-center">
        <Icon
          className={cn(
            "size-[18px] transition-transform duration-300 group-hover:scale-110",
            active && "text-accent"
          )}
        />
        {hasBadge && !open && (
          <span className={cn("absolute right-3 top-2.5 size-2 rounded-full ring-2 ring-surface", item.badgeTone === "danger" ? "bg-danger" : "bg-accent")} />
        )}
      </span>

      <AnimatePresence initial={false}>
        {open && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="relative flex-1 truncate whitespace-nowrap pr-3"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {hasBadge && open && (
        <motion.span
          key={item.badge}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className={cn("relative mr-3 grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums", badgeClass)}
        >
          {item.badge}
        </motion.span>
      )}

      {/* Tooltip con el nombre cuando el menú está contraído */}
      <AnimatePresence>
        {!open && tip && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{ left: tip.x, top: tip.y }}
            className="pointer-events-none fixed z-[60] -translate-y-1/2 whitespace-nowrap rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-cream shadow-card"
          >
            {item.label}
            {hasBadge && <span className="ml-1.5 text-muted">({item.badge})</span>}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
