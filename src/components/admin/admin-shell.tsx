"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  ChefHat,
  BarChart3,
  Users,
  UtensilsCrossed,
  Tags,
  Images,
  Settings,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { DashboardShell, type SidebarNavGroup } from "@/components/ui/dashboard-with-collapsible-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export interface AdminCounts {
  newOrders: number;
  deliveriesSoon: number;
  alerts: number;
}

export function AdminShell({
  counts,
  email,
  demo,
  defaultOpen,
  children,
}: {
  counts: AdminCounts;
  email: string | null;
  demo: boolean;
  defaultOpen: boolean;
  children: ReactNode;
}) {
  const groups: SidebarNavGroup[] = [
    {
      label: "Operación",
      items: [
        { href: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true, badge: counts.alerts, badgeTone: "danger" },
        { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList, badge: counts.newOrders },
        { href: "/admin/agenda", label: "Agenda", icon: CalendarDays, badge: counts.deliveriesSoon },
        { href: "/admin/produccion", label: "Producción", icon: ChefHat },
      ],
    },
    {
      label: "Negocio",
      items: [
        { href: "/admin/estadisticas", label: "Estadísticas", icon: BarChart3 },
        { href: "/admin/clientes", label: "Clientes", icon: Users },
      ],
    },
    {
      label: "Catálogo",
      items: [
        { href: "/admin/menu", label: "Menú", icon: UtensilsCrossed },
        { href: "/admin/categorias", label: "Categorías", icon: Tags },
        { href: "/admin/galeria", label: "Galería", icon: Images },
      ],
    },
    {
      label: "Cuenta",
      items: [
        { href: "/admin/configuracion", label: "Configuración", icon: Settings },
        { href: "/", label: "Ver sitio", icon: ExternalLink, external: true },
      ],
    },
  ];

  return (
    <DashboardShell
      groups={groups}
      defaultOpen={defaultOpen}
      cookieName="admin-sidebar"
      brand={(open) => <Brand open={open} />}
      footer={(open) => <Footer open={open} email={email} demo={demo} />}
      banner={
        demo ? (
          <div className="border-b border-accent/30 bg-accent/10 px-5 py-2 text-center text-xs font-medium text-accent">
            Modo demo local · datos de ejemplo, no son pedidos reales. Las acciones no se guardan.
          </div>
        ) : null
      }
    >
      {children}
    </DashboardShell>
  );
}

function Brand({ open }: { open: boolean }) {
  return (
    <Link href="/admin" className="flex items-center gap-3 rounded-xl px-1.5 py-1">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-bg">
        <Image src="/logo.png" alt="" width={34} height={33} className="dark:invert" />
      </span>
      <AnimatePresence initial={false}>
        {open && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="min-w-0 whitespace-nowrap leading-tight"
          >
            <span className="block font-display text-[1.05rem] text-cream">Umami Bites</span>
            <span className="block text-xs text-muted">Panel de gestión</span>
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

function Footer({ open, email, demo }: { open: boolean; email: string | null; demo: boolean }) {
  const router = useRouter();
  const initial = (email ?? "A").charAt(0).toUpperCase();

  async function signOut() {
    if (demo) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className={open ? "flex items-center gap-2" : "flex flex-col items-center gap-2"}>
      <span
        title={email ?? undefined}
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/15 font-display text-base text-accent"
      >
        {initial}
      </span>
      {open && (
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-xs font-medium text-cream">{email ?? "Administrador"}</p>
          <p className="text-[11px] text-muted">Dueño</p>
        </div>
      )}
      <ThemeToggle className="h-9 w-9 shrink-0 rounded-lg [&_svg]:size-4" />
      <button
        type="button"
        onClick={signOut}
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
        className="grid size-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  );
}
