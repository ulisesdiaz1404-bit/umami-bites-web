import { Reveal } from "@/components/ui/reveal";

const STEPS = [
  {
    title: "Elegís",
    text: "Armás tu pedido con picadas, complementos, menús o mesa dulce desde nuestro menú online.",
  },
  {
    title: "Coordinamos la entrega",
    text: "Definís fecha y lugar. Lo llevamos a domicilio, salón, quinta u oficina —o lo retirás vos—, con vajilla y mantelería.",
  },
  {
    title: "Disfrutás",
    text: "Nos ocupamos del servicio de mesa para que vos solo disfrutes del encuentro.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-[0.9fr_1.4fr] lg:gap-20 lg:px-8">
        <Reveal>
          <span className="eyebrow">Cómo funciona</span>
          <h2 className="mt-3 max-w-md font-display text-3xl text-cream sm:text-4xl lg:text-5xl">
            Tan simple como <span className="accent-serif">tres pasos</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <ol className="divide-y divide-line border-y border-line">
            {STEPS.map((step, i) => (
              <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-x-4 py-7">
                <span className="font-display text-2xl italic text-accent">{i + 1}.</span>
                <div>
                  <h3 className="font-display text-2xl text-cream">{step.title}</h3>
                  <p className="mt-2 max-w-prose text-[0.95rem] leading-relaxed text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
