import { createPublicClient } from "@/lib/supabase/public";

// =====================================================================
// Fotos de la galería del home. Si la tabla `gallery_photos` existe y tiene
// filas, es la fuente de verdad (editable desde el panel → Galería). Si no,
// se muestran las fotos por defecto de /public/photos. Así el sitio funciona
// aunque no se haya corrido la migración 0004.
// =====================================================================

export interface GalleryPhoto {
  src: string;
  alt: string;
  width: number;
  height: number;
}

/** Fotos por defecto (las que venían fijas en el código). */
export const DEFAULT_GALLERY: readonly GalleryPhoto[] = [
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

export interface GalleryRow {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  sort_order: number;
}

export async function getGalleryPhotos(): Promise<readonly GalleryPhoto[]> {
  const supabase = createPublicClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("gallery_photos")
      .select("url, alt, width, height, sort_order")
      .order("sort_order", { ascending: true });
    if (!error && data && data.length > 0) {
      return (data as GalleryRow[]).map((r) => ({
        src: r.url,
        alt: r.alt || "Foto de Umami Bites",
        width: r.width,
        height: r.height,
      }));
    }
  }
  return DEFAULT_GALLERY;
}
