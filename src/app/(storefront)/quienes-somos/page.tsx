import type { Metadata } from "next";
import { AboutSection } from "@/components/home/about-section";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "Umami Bites Catering: opciones de menú con productos de primera calidad, vajilla y mantelería exclusiva. Eventos desde cumpleaños hasta casamientos, en salones, casas privadas o al aire libre.",
  alternates: { canonical: "/quienes-somos" },
};

export default function QuienesSomosPage() {
  return (
    <div className="pt-20">
      <AboutSection />
    </div>
  );
}
