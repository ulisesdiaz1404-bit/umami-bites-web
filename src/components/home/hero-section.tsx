import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Componente de servidor: el título se pinta en el primer render (sin esperar
// a que hidrate JS), que es lo que mide el LCP. Las animaciones son CSS.
const COVER = {
  src: "/photos/portada-picada.jpg",
  alt: "Picada Umami de autor con fiambres, quesos y frutas para eventos",
};

export function HeroSection() {
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#0d0703]">
      <div className="absolute inset-0 z-0">
        <Image
          src={COVER.src}
          alt={COVER.alt}
          fill
          priority
          fetchPriority="high"
          quality={75}
          sizes="100vw"
          className="object-cover"
        />
        {/* Velos para legibilidad del texto y fundido hacia la página */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0703]/75 via-[#0d0703]/40 to-[#0d0703]/85" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-bg" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-5 py-28 text-center lg:px-8">
        <p className="text-sm font-medium text-[#e9c48f]">
          Catering para eventos en Buenos Aires y GBA
        </p>

        <h1
          className="mt-5 max-w-3xl font-display text-5xl leading-[1.02] sm:text-6xl lg:text-7xl xl:text-8xl"
          style={{
            // Inline gana al `h1{color:var(--color-cream)}` (que cambia con el tema).
            color: "#FBF6EC",
            textShadow: "0 2px 18px rgba(0,0,0,0.55)",
          }}
        >
          El sabor profundo,{" "}
          <span className="accent-serif block" style={{ color: "#d59b52" }}>
            en tu mesa
          </span>
        </h1>

        <p
          className="rise mt-7 max-w-xl text-lg leading-relaxed text-white/85 drop-shadow-[0_1px_12px_rgba(0,0,0,0.7)]"
          style={{ animationDelay: "120ms" }}
        >
          Picadas de autor, menús completos y mesas dulces con producto de primera calidad.
          Vajilla, mantelería y servicio incluidos. Llevamos tu evento a CABA y todo el Gran
          Buenos Aires.
        </p>

        <div
          className="rise mt-9 flex flex-wrap items-center justify-center gap-4"
          style={{ animationDelay: "240ms" }}
        >
          <Button asChild size="lg">
            <Link href="/menu">
              Ver servicios <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="glass">
            <Link href="/menu?servicio=menus">Nuestros menús</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
