"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { THEME_STORAGE_KEY } from "@/lib/theme";

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {}
    setDark(next);
  };

  const label = dark ? "Usar modo claro" : "Usar modo oscuro";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-2 hover:text-cream",
        className
      )}
    >
      {/* Antes de montar no sabemos el tema: se reserva el lugar sin ícono (evita mismatch). */}
      {dark === null ? null : dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
