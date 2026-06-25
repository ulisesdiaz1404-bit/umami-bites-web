import Link from "next/link";
import { Instagram, Phone } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { CONTACT, WHATSAPP_HREF } from "@/lib/contact";

const EVENTS = ["Reuniones con amigos y familia", "Cumpleaños", "Eventos empresariales", "Casamientos", "Y mucho más…"];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-bg-deep">
      <div className="grain absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-5">
            <Logo mark={52} />
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              Sabor profundo y presentación impecable. Llevamos nuestro servicio de catering a
              domicilio, salones, quintas y oficinas. Una buena picada inicia un gran encuentro.
            </p>
            <Button asChild variant="outline" size="sm">
              <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">
                Cotizá tu evento
              </a>
            </Button>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-medium uppercase tracking-[0.24em] text-accent">Navegación</h4>
            <ul className="space-y-2.5 text-sm text-primary/85">
              <li><Link href="/" className="transition-colors hover:text-cream">Inicio</Link></li>
              <li><Link href="/menu" className="transition-colors hover:text-cream">Servicios</Link></li>
              <li><Link href="/menu?servicio=menus" className="transition-colors hover:text-cream">Menús completos</Link></li>
              <li><Link href="/quienes-somos" className="transition-colors hover:text-cream">Quiénes somos</Link></li>
              <li><Link href="/cart" className="transition-colors hover:text-cream">Mi carrito</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-medium uppercase tracking-[0.24em] text-accent">Eventos</h4>
            <ul className="space-y-2.5 text-sm text-muted">
              {EVENTS.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Umami Bites Catering. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-5 text-sm text-primary/85">
            <a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-cream"
            >
              <Instagram className="size-4 text-accent" /> {CONTACT.instagram}
            </a>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-cream"
            >
              <Phone className="size-4 text-accent" /> {CONTACT.phonePrimary}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
