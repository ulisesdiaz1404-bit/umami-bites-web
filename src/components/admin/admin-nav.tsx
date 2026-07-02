"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  UtensilsCrossed,
  CalendarDays,
  BarChart3,
  Users,
  Tags,
  Settings,
} from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/admin/estadisticas", label: "Estadísticas", icon: BarChart3 },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/menu", label: "Menú", icon: UtensilsCrossed },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1.5">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors"
            style={{
              background: active ? "#b07a3c" : "transparent",
              color: active ? "#fff" : "#6b5236",
            }}
          >
            <Icon className="size-4" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
