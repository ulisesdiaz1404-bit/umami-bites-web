"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import { Button, type ButtonProps } from "@/components/ui/button";

// =====================================================================
// CTA de WhatsApp con tracking de conversión (Vercel Analytics).
// Envuelve un enlace wa.me y dispara el evento `whatsapp_click` con la
// ubicación desde donde se hizo click (para saber qué CTA convierte).
// Es un client component: las secciones server (about, footer) lo usan
// en lugar del <Button asChild><Link/></Button> plano, porque un onClick
// no puede pasarse desde un server component.
// =====================================================================

interface WaCtaProps {
  href: string;
  /** Etiqueta de la ubicación del CTA (ej. "about", "footer", "footer-phone"). */
  location: string;
  children: React.ReactNode;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  /** Render como <a> plano (sin estilos de Button), p.ej. el link de teléfono. */
  plain?: boolean;
}

export function WaCta({
  href,
  location,
  children,
  variant,
  size,
  className,
  plain,
}: WaCtaProps) {
  const onClick = () => track("whatsapp_click", { location });

  if (plain) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
        {children}
      </Link>
    </Button>
  );
}
