"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mejores fotos reales (horizontales, alta calidad) para el slideshow de portada.
const SLIDES = [
  "/photos/mesa-dulce-3.jpg",       // mesa dulce (casa de campo)
  "/photos/carnes-desmechadas-1.jpg", // olla de carne desmechada
  "/photos/shots-guacamole.jpg",    // shots de guacamole y nachos
  "/photos/mesa-dulce-2.jpg",       // mesa dulce al sol
  "/photos/picada-umami-3.jpg",     // picada Umami
  "/photos/pinchos-cherry.jpg",     // pinchos de tomate cherry
] as const;

const INTERVAL = 5200; // ms por imagen
const FADE = 1.5; // s de crossfade
const ease = [0.22, 0.8, 0.2, 1] as const;
const KEN_BURNS = (INTERVAL + FADE * 1000) / 1000; // duración del zoom lento

export function HeroSection() {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const scaleBg = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  useEffect(() => {
    const id = setInterval(() => setIndex((p) => (p + 1) % SLIDES.length), INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#0d0703]"
    >
      {/* Slideshow 4K a pantalla completa: todas montadas (sin tirones) + zoom lento */}
      <motion.div style={{ y: yBg, scale: scaleBg }} className="absolute inset-0 z-0">
        {SLIDES.map((src, idx) => {
          const active = idx === index;
          return (
            <motion.div
              key={src}
              aria-hidden={!active}
              initial={false}
              animate={{ opacity: active ? 1 : 0, scale: active ? 1.08 : 1 }}
              transition={{
                opacity: { duration: FADE, ease },
                scale: { duration: active ? KEN_BURNS : 0, ease: "linear" },
              }}
              className="absolute inset-0 will-change-[opacity,transform] [transform:translateZ(0)]"
            >
              <Image
                src={src}
                alt="Catering elegante de Umami Bites"
                fill
                priority={idx < 2}
                quality={90}
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          );
        })}

        {/* Velos para legibilidad del texto y fundido hacia la página clara */}
        <div className="absolute inset-0 bg-[#0d0703]/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,7,3,0.35)_0%,transparent_45%,rgba(13,7,3,0.5)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0703]/75 via-[#0d0703]/25 to-[#0d0703]/85" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-bg" />
      </motion.div>

      <motion.div
        style={{ y: yContent, opacity }}
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-5 py-28 text-center lg:px-8"
      >
        <motion.span
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="eyebrow"
        >
          <Sparkles className="size-3.5" /> Catering premium · Envío o retiro
        </motion.span>

        <h1
          className="mt-6 max-w-3xl font-display text-5xl leading-[1.02] text-[#FBF6EC] sm:text-6xl lg:text-7xl xl:text-8xl"
          style={{
            textShadow:
              "0 1px 3px rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.7), 0 6px 40px rgba(0,0,0,0.5)",
          }}
        >
          {["El", "sabor", "profundo,"].map((word, idx) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1, duration: 0.8, ease }}
              className="mr-[0.25em] inline-block"
            >
              {word}
            </motion.span>
          ))}
          <motion.span
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.8, ease }}
            className="accent-serif block"
            style={{ color: "#FBF6EC" }}
          >
            en tu mesa
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.8 }}
          className="mt-7 max-w-xl text-lg leading-relaxed text-white/85 drop-shadow-[0_1px_12px_rgba(0,0,0,0.7)]"
        >
          Picadas de autor, menús completos y mesas dulces con producto de primera calidad.
          Vajilla, mantelería y servicio incluidos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.8 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-4"
        >
          <Button asChild size="lg">
            <Link href="/menu">
              Ver servicios <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="glass">
            <Link href="/menu?servicio=menus">Nuestros menús</Link>
          </Button>
        </motion.div>

        {/* Indicadores del slideshow */}
        <div className="mt-12 flex items-center gap-2.5">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide}
              type="button"
              aria-label={`Ver imagen ${idx + 1}`}
              onClick={() => setIndex(idx)}
              className="group h-2 rounded-full transition-all duration-500"
              style={{ width: idx === index ? 28 : 8 }}
            >
              <span
                className={`block h-full w-full rounded-full transition-colors ${
                  idx === index ? "bg-accent" : "bg-white/35 group-hover:bg-white/60"
                }`}
              />
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
