import { CalendarCheck, ConciergeBell, UtensilsCrossed } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";

const STEPS = [
  {
    icon: UtensilsCrossed,
    title: "Elegís",
    text: "Armás tu pedido con picadas, complementos, menús o mesa dulce desde nuestro menú online.",
  },
  {
    icon: CalendarCheck,
    title: "Coordinamos la entrega",
    text: "Definís fecha y lugar. Llevamos todo a domicilio, salón, quinta u oficina, con vajilla y mantelería.",
  },
  {
    icon: ConciergeBell,
    title: "Disfrutás",
    text: "Nos ocupamos del servicio de mesa para que vos solo disfrutes del encuentro.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <Reveal>
        <span className="eyebrow">Cómo funciona</span>
        <h2 className="mt-5 max-w-2xl font-display text-3xl text-cream sm:text-4xl lg:text-5xl">
          Tan simple como <span className="accent-serif">tres pasos</span>
        </h2>
      </Reveal>

      <RevealGroup className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
        {STEPS.map((step) => (
          <RevealItem key={step.title}>
            <div className="group flex h-full flex-col gap-4 bg-surface p-8 transition-colors hover:bg-surface-2">
              <div className="grid size-14 place-items-center rounded-full border border-accent/30 text-accent transition-transform duration-300 group-hover:scale-110">
                <step.icon className="size-6" />
              </div>
              <h3 className="font-display text-2xl text-cream">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{step.text}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
