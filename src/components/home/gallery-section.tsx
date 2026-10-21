import { Reveal } from "@/components/ui/reveal";
import { Gallery, type GalleryPhoto } from "@/components/home/gallery";
import { CONTACT } from "@/lib/contact";

const PHOTOS: readonly GalleryPhoto[] = [
  { src: "/photos/p03.jpg", width: 1536, height: 1024, alt: "Tabla de quesos, fiambres y aceitunas" },
  { src: "/photos/p04.jpg", width: 1024, height: 1536, alt: "Mesa de campo al aire libre con picada, dips y flores" },
  { src: "/photos/p19.jpg", width: 1086, height: 1448, alt: "Empanadas sobre tabla de madera a la luz de las velas" },
  { src: "/photos/p20.jpg", width: 1061, height: 1599, alt: "Torta de frutos rojos con merengue" },
  { src: "/photos/p26.jpg", width: 1015, height: 1600, alt: "Tabla de quesos con aceitunas y papas fritas" },
  { src: "/photos/p18.jpg", width: 1080, height: 821, alt: "Picada con fiambres, quesos y frutas entre velas y flores" },
  { src: "/photos/p31.jpg", width: 1080, height: 607, alt: "Mesa de catering armada en un jardín" },
  { src: "/photos/p15.jpg", width: 1200, height: 1600, alt: "Picada con uvas, quesos y fiambres" },
  { src: "/photos/p24.jpg", width: 842, height: 604, alt: "Tarta de frutillas" },
  { src: "/photos/p30.jpg", width: 1448, height: 1086, alt: "Torta de dulce de leche con merengue y nueces" },
  { src: "/photos/p29.jpg", width: 1600, height: 1200, alt: "Picada navideña con arbolito de quesos" },
  { src: "/photos/p32.jpg", width: 1122, height: 1402, alt: "Key lime pie con crema" },
];

export function GallerySection() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="eyebrow">Galería</span>
            <h2 className="mt-3 max-w-xl font-display text-3xl text-cream sm:text-4xl lg:text-5xl">
              Así se ven <span className="accent-serif">nuestras mesas</span>
            </h2>
          </div>
          <a
            href={CONTACT.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            Más fotos en {CONTACT.instagram}
          </a>
        </div>
      </Reveal>

      <div className="mt-12">
        <Gallery photos={PHOTOS} />
      </div>
    </section>
  );
}
