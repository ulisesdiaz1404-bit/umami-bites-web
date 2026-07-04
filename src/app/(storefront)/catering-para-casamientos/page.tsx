import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Check, ArrowRight, Heart, Sparkles, MapPin } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { WaCta } from "@/components/analytics/wa-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { getSettings } from "@/lib/data/settings.server";
import { getItemBySlug } from "@/lib/data/menu";
import { SITE_URL } from "@/lib/site";

// ISR: refleja precios/fotos del catálogo sin redeploy.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Catering para Casamientos en Buenos Aires",
  description:
    "Catering para casamientos en Buenos Aires y GBA: asado al asador, mesa de campo premium, barra de tragos y mesa dulce. Vajilla, mantelería y servicio de mesa incluidos. Trabajamos en salones, casas y quintas. Cotizá por WhatsApp.",
  alternates: { canonical: "/catering-para-casamientos" },
  openGraph: {
    title: "Catering para Casamientos en Buenos Aires · Umami Bites",
    description:
      "Asado al asador, mesa de campo premium, barra de tragos y mesa dulce. Servicio completo para tu casamiento en CABA y GBA.",
    url: "/catering-para-casamientos",
    type: "website",
  },
};

// Menús que mejor funcionan para un casamiento.
const WEDDING_SLUGS = [
  "menu-asado-al-asador",
  "mesa-de-campo-umami",
  "barra-libre-tragos",
  "mesa-dulce",
];

const INCLUYE = [
  "Recepción con mesa de campo de fiambres, quesos y dips",
  "Comida principal a elección (asado al asador, menús completos)",
  "Bebida sin alcohol (barra de tragos opcional)",
  "Vajilla y mantelería exclusiva",
  "Servicio de mesa profesional",
  "Mesa dulce y tortas a elección",
];

const FAQ = [
  {
    q: "¿Cuál es el mínimo de invitados?",
    a: "Los menús completos son por persona, con un mínimo de 20. Para casamientos armamos una propuesta a medida según la cantidad de invitados.",
  },
  {
    q: "¿A qué zonas llevan el catering de casamiento?",
    a: "Llegamos a CABA y a todo el Gran Buenos Aires (Zona Norte, Oeste y Sur). El costo de envío se calcula por distancia desde nuestra base en Bella Vista.",
  },
  {
    q: "¿Qué incluye el servicio?",
    a: "Recepción, comida principal, bebida sin alcohol, vajilla, mantelería y servicio de mesa. Podés sumar mesa dulce y barra de tragos con alcohol.",
  },
  {
    q: "¿Trabajan al aire libre o en salón?",
    a: "Ambos. Trabajamos en salones, casas y quintas, y además contamos con espacio propio al aire libre.",
  },
  {
    q: "¿Con cuánta anticipación conviene reservar?",
    a: "Para casamientos recomendamos reservar con varias semanas de anticipación para asegurar tu fecha.",
  },
];

const WA_MESSAGE = encodeURIComponent(
  "¡Hola Umami Bites! Quiero cotizar el catering para mi casamiento 💍"
);

export default async function CateringCasamientosPage() {
  const settings = await getSettings();
  const waHref = `https://wa.me/${settings.whatsapp}?text=${WA_MESSAGE}`;

  const items = (await Promise.all(WEDDING_SLUGS.map((s) => getItemBySlug(s)))).filter(
    (i): i is NonNullable<typeof i> => Boolean(i)
  );

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Catering para casamientos",
        item: `${SITE_URL}/catering-para-casamientos`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* HERO */}
      <section className="relative flex min-h-[78vh] items-center justify-center overflow-hidden bg-[#0d0703]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/photos/mesa-dulce-2.jpg"
            alt="Mesa de campo y mesa dulce de Umami Bites para un casamiento al aire libre"
            fill
            priority
            quality={85}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#0d0703]/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0703]/70 via-[#0d0703]/30 to-[#0d0703]/90" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-bg" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-5 py-28 text-center">
          <span className="eyebrow">
            <Heart className="size-3.5" /> Catering para casamientos
          </span>
          <h1
            className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl"
            style={{
              color: "#FBF6EC",
              textShadow: "0 2px 12px rgba(0,0,0,0.7), 0 6px 40px rgba(0,0,0,0.5)",
            }}
          >
            Catering para casamientos en{" "}
            <span className="accent-serif" style={{ color: "#d59b52" }}>
              Buenos Aires
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 drop-shadow-[0_1px_12px_rgba(0,0,0,0.7)]">
            El día más importante merece una mesa impecable. Asado al asador, mesa de campo premium,
            barra de tragos y mesa dulce, con vajilla, mantelería y servicio incluidos. En CABA y
            todo el Gran Buenos Aires.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <WaCta href={waHref} location="casamientos-hero" size="lg">
              <MessageCircle className="size-4" /> Cotizá tu casamiento
            </WaCta>
            <Button asChild size="lg" variant="glass">
              <Link href="/menu?servicio=menus">Ver menús</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* PROPUESTA */}
      <section className="mx-auto max-w-6xl px-5 py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <Reveal direction="left">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl shadow-soft">
              <Image
                src="/photos/asado-1.jpg"
                alt="Asado al asador de Umami Bites para el menú principal de un casamiento"
                fill
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal direction="right">
            <span className="eyebrow">
              <Sparkles className="size-3.5" /> Nuestra propuesta
            </span>
            <h2 className="mt-5 font-display text-3xl text-cream sm:text-4xl">
              Un servicio pensado para tu <span className="accent-serif">gran día</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-primary/85">
              Seleccionamos los mejores productos de primera calidad y cuidamos cada detalle de la
              presentación. Trabajamos en salones, casas privadas y quintas, y contamos con espacio
              propio al aire libre para tu celebración.
            </p>
            <div className="mt-7 flex items-center gap-2 text-sm text-primary/80">
              <MapPin className="size-4 text-accent" />
              CABA · Zona Norte · Zona Oeste · Zona Sur
            </div>
            <div className="mt-8">
              <WaCta href={waHref} location="casamientos-propuesta" size="lg">
                <MessageCircle className="size-4" /> Pedí tu presupuesto
              </WaCta>
            </div>
          </Reveal>
        </div>
      </section>

      {/* MENÚS RECOMENDADOS */}
      {items.length > 0 && (
        <section className="border-y border-line bg-bg-deep">
          <div className="mx-auto max-w-6xl px-5 py-24 lg:px-8">
            <Reveal>
              <span className="eyebrow">Para tu casamiento</span>
              <h2 className="mt-5 font-display text-3xl text-cream sm:text-4xl">
                Menús que <span className="accent-serif">enamoran</span>
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-primary/85">
                Estas son las opciones que más eligen las parejas. Tocá cualquiera para ver el
                detalle y sumarla a tu presupuesto.
              </p>
            </Reveal>

            <RevealGroup className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item) => (
                <RevealItem key={item.slug}>
                  <Link
                    href={`/menu/${item.slug}`}
                    className="group block h-full overflow-hidden rounded-xl border border-line bg-surface transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={item.images[0]?.url ?? "/images/hero.svg"}
                        alt={item.images[0]?.alt ?? item.name}
                        fill
                        sizes="(max-width:640px) 100vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg text-cream">{item.name}</h3>
                      {item.metadata?.tagline && (
                        <p className="mt-1 text-xs text-muted">{item.metadata.tagline}</p>
                      )}
                      <span className="mt-3 inline-flex items-center gap-1 text-sm text-accent">
                        Ver detalle
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* QUÉ INCLUYE */}
      <section className="mx-auto max-w-5xl px-5 py-24 lg:px-8">
        <Reveal>
          <span className="eyebrow">Servicio completo</span>
          <h2 className="mt-5 font-display text-3xl text-cream sm:text-4xl">
            Qué <span className="accent-serif">incluye</span>
          </h2>
        </Reveal>
        <RevealGroup className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {INCLUYE.map((inc) => (
            <RevealItem key={inc}>
              <div className="flex items-start gap-3 rounded-base border border-line bg-surface p-5">
                <Check className="mt-0.5 size-5 shrink-0 text-accent" />
                <span className="text-primary/90">{inc}</span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* FAQ */}
      <section className="border-t border-line bg-bg-deep">
        <div className="mx-auto max-w-3xl px-5 py-24 lg:px-8">
          <Reveal>
            <span className="eyebrow">Preguntas frecuentes</span>
            <h2 className="mt-5 font-display text-3xl text-cream sm:text-4xl">
              Todo lo que <span className="accent-serif">querés saber</span>
            </h2>
          </Reveal>
          <div className="mt-10 space-y-4">
            {FAQ.map((f) => (
              <Reveal key={f.q}>
                <div className="rounded-xl border border-line bg-surface p-6">
                  <h3 className="font-display text-lg text-cream">{f.q}</h3>
                  <p className="mt-2 leading-relaxed text-primary/85">{f.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-4xl px-5 py-24 text-center lg:px-8">
        <Reveal>
          <h2 className="font-display text-3xl text-cream sm:text-4xl lg:text-5xl">
            Hagamos de tu casamiento algo <span className="accent-serif">inolvidable</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-primary/85">
            Contanos la fecha, la cantidad de invitados y la zona. Te armamos una propuesta a medida.
          </p>
          <div className="mt-9 flex justify-center">
            <WaCta href={waHref} location="casamientos-final" size="lg">
              <MessageCircle className="size-4" /> Cotizá tu casamiento por WhatsApp
            </WaCta>
          </div>
        </Reveal>
      </section>
    </>
  );
}
