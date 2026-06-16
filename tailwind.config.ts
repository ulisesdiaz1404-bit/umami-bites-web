import type { Config } from "tailwindcss";

/**
 * Tailwind v4 toma el grueso del theme desde `@theme` en globals.css.
 * Este archivo declara el content scanning y queda como punto único de
 * extensión para la Fase 2 (plugins, design tokens adicionales).
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
};

export default config;
