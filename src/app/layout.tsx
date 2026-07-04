import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/providers";
import { JsonLd } from "@/components/seo/json-ld";
import { catererSchema } from "@/lib/seo/schema";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Catering para Eventos en Buenos Aires | Umami Bites Catering",
    template: "%s · Umami Bites Catering",
  },
  description:
    "Catering premium a domicilio en Buenos Aires y GBA: casamientos, cumpleaños y eventos corporativos. Picadas de autor, menús completos (asado, criolla, pizza party), brunch, mesa dulce y barra de tragos. Vajilla, mantelería y servicio incluidos.",
  metadataBase: new URL(SITE_URL),
  keywords: [
    "catering para eventos",
    "catering a domicilio buenos aires",
    "catering corporativo",
    "catering para casamientos",
    "catering para cumpleaños",
    "picadas para eventos",
    "catering zona norte",
    "catering zona oeste",
    "asado al asador",
    "mesa dulce",
  ],
  openGraph: {
    title: "Umami Bites Catering — Catering para eventos en Buenos Aires",
    description:
      "Casamientos, cumpleaños y eventos corporativos en CABA y GBA. Picadas de autor, menús completos, mesa dulce y barra de tragos.",
    url: "/",
    siteName: "Umami Bites Catering",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Umami Bites Catering — Catering para eventos en Buenos Aires",
    description:
      "Casamientos, cumpleaños y eventos corporativos en CABA y GBA. Picadas, menús completos, mesa dulce y barra de tragos.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-bg text-primary antialiased">
        <JsonLd data={catererSchema()} />
        <Providers>{children}</Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
