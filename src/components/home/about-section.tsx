import Image from "next/image";
import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { CONTACT } from "@/lib/contact";
import { whatsappHref } from "@/lib/data/settings";
import { getSettings } from "@/lib/data/settings.server";

/** Quiénes somos — presentación del servicio de catering. */
export async function AboutSection() {
  const settings = await getSettings();
  const waHref = whatsappHref(settings.whatsapp);
  return (
    <section id="quienes-somos" className="relative overflow-hidden border-y border-line bg-bg-deep">
      <div className="grain absolute inset-0" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-28 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        <Reveal direction="left">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl shadow-soft sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src="/photos/picada-umami-2.jpg"
              alt="Mesa de campo de Umami Bites Catering, lista para un evento"
              fill
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          </div>
        </Reveal>

        <Reveal direction="right">
          <span className="eyebrow">Quiénes somos</span>
          <h2 className="mt-5 font-display text-4xl text-cream sm:text-5xl">
            Celebrá tu evento con nuestro <span className="accent-serif">servicio de catering</span>
          </h2>

          <div className="mt-6 space-y-4 text-lg leading-relaxed text-primary/85">
            <p>
              Ofrecemos diferentes opciones de menú seleccionando los mejores productos de primera
              calidad. Nuestra vajilla y mantelería es exclusiva, pensada para que tu mesa luzca
              increíble.
            </p>
            <p>
              Realizamos eventos desde pequeñas reuniones como cumpleaños y eventos empresariales,
              hasta casamientos. Trabajamos tanto en salones como en casas privadas y, además,
              contamos con espacio al aire libre propio.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link href={waHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" /> Cotizá tu evento
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer">
                <Instagram className="size-4" /> {CONTACT.instagram}
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
