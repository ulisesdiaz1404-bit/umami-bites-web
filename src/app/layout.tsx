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
    default: "Umami Bites Catering — El sabor profundo, en tu mesa",
    template: "%s · Umami Bites Catering",
  },
  description:
    "Catering premium con envío o retiro: picadas de autor, menús completos (asado, criolla, pizza party, sándwich a la parrilla), brunch, finger food y mesa dulce. Vajilla, mantelería y servicio incluidos.",
  metadataBase: new URL(SITE_URL),
  keywords: [
    "catering a domicilio",
    "picadas",
    "asado al asador",
    "comida criolla",
    "mesa dulce",
    "brunch",
    "eventos",
  ],
  openGraph: {
    title: "Umami Bites Catering",
    description: "El sabor profundo, en tu mesa. Catering premium con envío o retiro.",
    locale: "es_AR",
    type: "website",
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
