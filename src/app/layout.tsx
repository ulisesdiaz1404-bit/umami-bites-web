import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
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
    default: "Umami Bites Catering — El sabor profundo, en tu puerta",
    template: "%s · Umami Bites Catering",
  },
  description:
    "Catering premium a domicilio: picadas de autor, menús completos (asado, criolla, pizza party, sándwich a la parrilla), brunch, finger food y mesa dulce. Vajilla, mantelería y servicio incluidos.",
  metadataBase: new URL("https://umamibites.com.ar"),
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
    description: "El sabor profundo, en tu puerta. Catering premium a domicilio.",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-bg text-primary antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
