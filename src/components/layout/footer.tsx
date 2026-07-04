import Link from "next/link";
import { Instagram, Phone, MapPin, Clock } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { WaCta } from "@/components/analytics/wa-cta";
import { CONTACT } from "@/lib/contact";
import { DEFAULT_SETTINGS, whatsappHref, type BusinessSettings } from "@/lib/data/settings";

const EVENTS = ["Reuniones con amigos y familia", "Cumpleaños", "Eventos empresariales", "Casamientos", "Y mucho más…"];

export function Footer({ settings = DEFAULT_SETTINGS }: { settings?: BusinessSettings }) {
  const waHref = whatsappHref(settings.whatsapp);
  return (
    <footer className="relative overflow-hidden border-t border-line bg-bg-deep">
      <div className="grain absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-5">
            <Logo mark={64} />
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              Sabor profundo y presentación impecable. Catering para eventos en Buenos Aires y GBA:
              CABA, Zona Norte (San Isidro, Vicente López, Tigre, Pilar), Zona Oeste (San Miguel,
              Bella Vista, Morón) y Zona Sur. Casamientos, cumpleaños y eventos corporativos.
            </p>
            <WaCta href={waHref} location="footer" variant="outline" size="sm">
              Cotizá tu evento
            </WaCta>

            {(settings.address || settings.hours) && (
              <ul className="space-y-2 pt-1 text-sm text-muted">
                {settings.address && (
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-accent" /> {settings.address}
                  </li>
                )}
                {settings.hours && (
                  <li className="flex items-start gap-2">
                    <Clock className="mt-0.5 size-4 shrink-0 text-accent" /> {settings.hours}
                  </li>
                )}
              </ul>
            )}
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
            <WaCta
              href={waHref}
              location="footer-phone"
              plain
              className="inline-flex items-center gap-2 transition-colors hover:text-cream"
            >
              <Phone className="size-4 text-accent" /> {settings.phonePrimary}
            </WaCta>
          </div>
        </div>
      </div>
    </footer>
  );
}
