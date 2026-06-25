import type { MenuItem } from "@/lib/types/menu-item";

// =====================================================================
// MOCK SOLO TEMPORAL — Fase 1.
// Catálogo real de Umami Bites Catering (precios en ARS, centavos).
// Fase 2: reemplazar este archivo por queries a Postgres. Los componentes
// consumen el type MenuItem, así que NO requieren cambios.
//
// Imágenes: placeholders SVG de marca en /public/images/<slug>.svg.
// Reemplazar por las fotos reales de Umami Bites (ver README » Imágenes).
// =====================================================================

const img = (slug: string, alt: string) => ({ url: `/images/${slug}.svg`, alt });

export const CURRENCY = "ARS" as const;

/** Categorías para el filtro secundario del menú. */
export const CATEGORIES = [
  "Picadas",
  "Empanadas",
  "Complementos",
  "Menús",
  "Brunch",
  "Mesa dulce",
  "Bebidas",
] as const;

// =====================================================================
// SERVICIOS — agrupación de alto nivel de la carta. Todo se ofrece como
// un servicio de catering, repartido en dos grandes grupos:
//   1) "Picadas y complementos": tablas, empanadas, finger food, mesa
//      dulce y bebidas que sumás a tu evento.
//   2) "Menús": menús completos para ~20+ personas (servicio integral:
//      recepción, comida, bebida, vajilla y servicio de mesa) + brunch.
// El grupo se DERIVA de la categoría (no se guarda en DB), así el filtro
// "Picadas y complementos / Menús" sale solo del campo `category`.
// =====================================================================
export const SERVICE_GROUPS = ["Picadas y complementos", "Menús"] as const;
export type ServiceGroup = (typeof SERVICE_GROUPS)[number];

const MENU_CATEGORIES = new Set(["Menús", "Brunch"]);

/** Devuelve a qué servicio pertenece una categoría. */
export function serviceGroupOf(category: string): ServiceGroup {
  return MENU_CATEGORIES.has(category) ? "Menús" : "Picadas y complementos";
}

export const MENU_ITEMS: MenuItem[] = [
  // ----------------------------- PICADAS -----------------------------
  {
    id: "pic-encuentro",
    slug: "picada-encuentro",
    name: "Picada Encuentro",
    description:
      "Jamón cocido y crudo, salamín fino, bondiola y mortadela con pistacho. 3 quesos (pategrás, ají molido y azul). Hummus de garbanzo y de morrón, tostaditas, aceitunas, frutas de estación y frutos secos.",
    priceInCents: 8_900_000,
    currency: "ARS",
    images: [img("picada-encuentro", "Picada Encuentro de Umami Bites")],
    available: true,
    maxQuantity: 10,
    category: "Picadas",
    type: "package",
    servings: 6,
    includes: [
      "Fiambres: jamón cocido, jamón crudo, salamín fino, bondiola, mortadela con pistacho",
      "Quesos: pategrás, ají molido, azul",
      "Hummus de garbanzo y limón + hummus de morrón",
      "Tostaditas saborizadas con finas hierbas",
      "Aceitunas, frutas de estación y frutos secos",
    ],
    metadata: {
      tagline: "Comen 6 · pican 10",
      tierMayor: "$120.000 — comen 8 / pican 12",
      unit: "tabla",
    },
  },
  {
    id: "pic-umami",
    slug: "picada-umami",
    name: "Picada Umami",
    description:
      "La especialidad de la casa. 6 fiambres premium (jamón crudo, bondiola, longaniza, salamines), 5 quesos (brie, rockefort, pategrás, ají y pimentón, pimienta negra), dips caseros, tostaditas, batatitas, frutas y frutos secos.",
    priceInCents: 18_000_000,
    currency: "ARS",
    images: [img("picada-umami", "Picada Umami — la especialidad de la casa")],
    available: true,
    maxQuantity: 6,
    category: "Picadas",
    type: "package",
    servings: 10,
    includes: [
      "6 fiambres premium incl. bondiola y longaniza",
      "5 quesos incl. brie y rockefort",
      "Dips caseros: berenjena, ciboulette, hummus de morrón",
      "Tostaditas saborizadas, pan de campo y batatitas fritas",
      "Aceitunas, frutas frescas y frutos secos",
    ],
    metadata: {
      tagline: "Comen 10 · pican 20",
      tierMayor: "$270.000 — comen 15 / pican 30",
      especialidad: "true",
      unit: "tabla",
    },
  },

  // ---------------------------- EMPANADAS ----------------------------
  {
    id: "emp-saltenas",
    slug: "empanadas-saltenas",
    name: "Empanadas (docena)",
    description:
      "Carne cortada a cuchillo (salteñas), caprese, verdura y humita. Congeladas o horneadas a elección. Mínimo 1 docena.",
    priceInCents: 2_600_000,
    currency: "ARS",
    images: [img("empanadas-saltenas", "Empanadas salteñas cortadas a cuchillo")],
    available: true,
    maxQuantity: 30,
    category: "Empanadas",
    type: "dish",
    metadata: { unit: "docena", estado: "Congeladas o horneadas a elección" },
  },
  {
    id: "emp-canastitas",
    slug: "canastitas-surtidas",
    name: "Canastitas (1/2 docena)",
    description:
      "De verdura y de jamón y queso. Congeladas o horneadas a elección. Mínimo 6 unidades por variedad.",
    priceInCents: 1_300_000,
    currency: "ARS",
    images: [img("canastitas-surtidas", "Canastitas de verdura y de jamón y queso")],
    available: true,
    maxQuantity: 30,
    category: "Empanadas",
    type: "dish",
    metadata: { unit: "1/2 docena", estado: "Congeladas o horneadas a elección" },
  },

  // --------------------------- COMPLEMENTOS --------------------------
  // Especialmente presentados en vajilla de madera o cerámica.
  {
    id: "ff-shots-guacamole",
    slug: "shots-guacamole-nachos",
    name: "Shots de guacamole y nachos (x12)",
    description:
      "Guacamole fresco en shots individuales con nachos crocantes, más nachos extra en canastita.",
    priceInCents: 1_600_000,
    currency: "ARS",
    images: [img("shots-guacamole-nachos", "Shots de guacamole con nachos")],
    available: true,
    maxQuantity: 20,
    category: "Complementos",
    type: "dish",
    metadata: { unit: "docena" },
  },
  {
    id: "ff-brusquetas",
    slug: "brusquetas-surtidas",
    name: "Brusquetas a elección (x24)",
    description:
      "A elección: jamón crudo y rúcula; mix de verduras; pera, queso azul, nuez y miel; cebolla caramelizada. 12 de cada variedad.",
    priceInCents: 1_800_000,
    currency: "ARS",
    images: [img("brusquetas-surtidas", "Brusquetas surtidas de Umami Bites")],
    available: true,
    maxQuantity: 20,
    category: "Complementos",
    type: "dish",
    metadata: { unit: "pack" },
  },
  {
    id: "ff-tarteletas",
    slug: "tarteletas-queso-azul-nuez",
    name: "Tarteletas de queso azul y nuez (x24)",
    description:
      "Mini tarteletas de queso azul y nuez y/o de pasta de aceitunas. Mínimo 24 unidades.",
    priceInCents: 1_800_000,
    currency: "ARS",
    images: [img("tarteletas-queso-azul-nuez", "Tarteletas de queso azul y nuez")],
    available: true,
    maxQuantity: 20,
    category: "Complementos",
    type: "dish",
    metadata: { unit: "pack" },
  },
  {
    id: "ff-salchichas",
    slug: "salchichas-copetin-vino",
    name: "Salchichas de copetín al vino tinto (x24)",
    description: "Salchichas de copetín glaseadas al vino tinto. Mínimo 24 unidades.",
    priceInCents: 1_600_000,
    currency: "ARS",
    images: [img("salchichas-copetin-vino", "Salchichas de copetín al vino tinto")],
    available: true,
    maxQuantity: 20,
    category: "Complementos",
    type: "dish",
    metadata: { unit: "pack" },
  },
  {
    id: "ff-pinchos-cherry",
    slug: "pinchos-tomate-cherry",
    name: "Pinchos de tomate cherry (x12)",
    description: "Tomate cherry, queso y albahaca fresca en pinchos individuales.",
    priceInCents: 900_000,
    currency: "ARS",
    images: [img("pinchos-tomate-cherry", "Pinchos de tomate cherry, queso y albahaca")],
    available: true,
    maxQuantity: 20,
    category: "Complementos",
    type: "dish",
    metadata: { unit: "docena" },
  },
  {
    id: "ff-camembert-castanas",
    slug: "camembert-castanas-miel",
    name: "Camembert con castañas y miel",
    description: "Queso camembert acompañado de castañas de cajú y un hilo de miel.",
    priceInCents: 2_200_000,
    currency: "ARS",
    images: [img("camembert-castanas-miel", "Queso camembert con castañas de cajú y miel")],
    available: true,
    maxQuantity: 20,
    category: "Complementos",
    type: "dish",
    metadata: { unit: "porción" },
  },
  {
    id: "ff-flor-papas",
    slug: "flor-de-papas",
    name: "Flor de papas",
    description: "Papas Pringles en flor sobre pasta de queso blanco saborizado.",
    priceInCents: 1_000_000,
    currency: "ARS",
    images: [img("flor-de-papas", "Flor de papas sobre pasta de queso blanco")],
    available: true,
    maxQuantity: 20,
    category: "Complementos",
    type: "dish",
    metadata: { unit: "porción" },
  },

  // ------------------------------ MENÚS ------------------------------
  {
    id: "menu-carnes-desmechadas",
    slug: "menu-carnes-desmechadas",
    name: 'Menú "Carnes desmechadas"',
    description:
      "Sandwichitos de carne vacuna y barbacoa y/o bondiola desmechada al vino tinto, con salsas caseras (queso crema y verdeo, mayonesa de berenjena, mayonesa de ajo, hummus de garbanzo y de morrón, pasta de aceitunas). Con recepción de mesa de campo: tabla de fiambres y quesos, empanadas criollas, dips, brusquetas y mini tarteletas.",
    priceInCents: 34_000_000,
    currency: "ARS",
    images: [img("menu-carnes-desmechadas", "Menú Carnes desmechadas")],
    available: true,
    maxQuantity: 20,
    category: "Menús",
    type: "package",
    servings: 20,
    includes: [
      "Recepción: mesa de campo completa",
      "Empanadas criollas y dips caseros",
      "Sandwichitos de carne y barbacoa / bondiola al vino tinto",
      "6 salsas a elección",
    ],
    metadata: {
      unit: "menú",
      tagline: "Menú para ~20 personas",
      incluye: "Recepción, comida ppal., bebida sin alcohol, vajilla, mantelería y servicio de mesa",
    },
  },
  {
    id: "menu-todo-sandwich",
    slug: "menu-todo-sandwich",
    name: 'Menú "Todo sándwich a la parrilla"',
    description:
      "Servicio en domicilio. Recepción con mesa de campo y sándwich de chorizo a la parrilla. La comida: sandwichitos en pan de figaza de manteca de lomo y carré de cerdo, acompañados de 3 salsas (agridulce de ciruela y mostaza, criolla, mayonesa de ajo y cebolla de verdeo) y otros aderezos.",
    priceInCents: 3_800_000,
    currency: "ARS",
    images: [img("menu-todo-sandwich", "Menú Todo sándwich a la parrilla")],
    available: true,
    maxQuantity: 300,
    category: "Menús",
    type: "package",
    servings: 1,
    includes: [
      "Recepción: mesa de campo + sándwich de chorizo a la parrilla",
      "Sandwichitos de lomo y carré de cerdo en pan de figaza",
      "3 salsas + aderezos",
      "Incluye servicio en domicilio",
    ],
    metadata: {
      unit: "persona",
      servicio: "Servicio en domicilio",
      incluye: "Recepción, comida ppal., bebida sin alcohol, vajilla, mantelería y servicio de mesa",
    },
  },
  {
    id: "menu-asado",
    slug: "menu-asado-al-asador",
    name: 'Menú "Asado al asador"',
    description:
      "Mesa de campo de recepción (fiambres, quesos, empanadas criollas y sándwich de chorizo bombón). La comida: 2 ensaladas a elección (clásica o gourmet), achuras (morcilla y mollejas al limón) y asado de vacío y costillar al asador según espacio disponible.",
    priceInCents: 5_500_000,
    currency: "ARS",
    images: [img("menu-asado-al-asador", "Menú Asado al asador")],
    available: true,
    maxQuantity: 300,
    category: "Menús",
    type: "package",
    servings: 1,
    includes: [
      "Mesa de campo de recepción",
      "2 ensaladas a elección (clásica / gourmet)",
      "Achuras: morcilla y mollejas al limón",
      "Asado: vacío y costillar al asador",
    ],
    metadata: {
      unit: "persona",
      incluye: "Recepción, comida ppal., bebida sin alcohol, vajilla, mantelería y servicio de mesa",
    },
  },
  {
    id: "menu-pizza-party",
    slug: "menu-pizza-party",
    name: 'Menú "Pizza party"',
    description:
      "Recepción con mesa de campo, empanadas de carne criollas, dips y brusquetas. La comida: pizzas de diferentes tipos — muzarella, napolitana, primavera, jamón y morrones, fugazzeta y ananá.",
    priceInCents: 2_900_000,
    currency: "ARS",
    images: [img("menu-pizza-party", "Menú Pizza party")],
    available: true,
    maxQuantity: 300,
    category: "Menús",
    type: "package",
    servings: 1,
    includes: [
      "Recepción: mesa de campo + empanadas criollas",
      "Dips y brusquetas surtidas",
      "Pizzas: muzarella, napolitana, primavera, jamón y morrones, fugazzeta, ananá",
    ],
    metadata: {
      unit: "persona",
      incluye: "Recepción, comida ppal., bebida sin alcohol, vajilla, mantelería y servicio de mesa",
    },
  },
  {
    id: "menu-comida-criolla",
    slug: "menu-comida-criolla",
    name: 'Menú "Comida criolla"',
    description:
      "Entrada: tabla de fiambres con 3 quesos, salames, jamón natural y crudo, pan de campo y empanadas salteñas cortadas a cuchillo. Principal a elección: guiso casero de lentejas pardinas con chorizo ahumado, panceta y verduras, o carbonada criolla con carne, papas, batatas, zapallo, choclo y orejones de durazno. Servido en cazuelas de barro norteñas.",
    priceInCents: 3_200_000,
    currency: "ARS",
    images: [img("menu-comida-criolla", "Menú Comida criolla — guiso en cazuela de barro")],
    available: true,
    maxQuantity: 300,
    category: "Menús",
    type: "package",
    servings: 1,
    includes: [
      "Entrada: tabla de fiambres, pan de campo, empanadas salteñas",
      "Opción 1: guiso de lentejas pardinas",
      "Opción 2: carbonada criolla",
      "Servido en cazuelas de barro norteñas",
    ],
    metadata: {
      unit: "persona",
      incluye: "Recepción, comida ppal., bebida sin alcohol, vajilla, mantelería y servicio de mesa",
    },
  },
  {
    id: "menu-encuentro",
    slug: "menu-encuentro",
    name: 'Menú "Encuentro"',
    description:
      "Recepción con mesa de campo (fiambres, quesos, dips de hummus y berenjenas en escabeche, panes, tostaditas saborizadas, grisines, batatitas fritas y crackers). La comida: 2 por persona — empanadas salteñas de carne, canastitas de verdura y canastitas caprese.",
    priceInCents: 1_800_000,
    currency: "ARS",
    images: [img("menu-encuentro", "Menú Encuentro")],
    available: true,
    maxQuantity: 300,
    category: "Menús",
    type: "package",
    servings: 1,
    includes: [
      "Recepción: mesa de campo completa",
      "Panes, tostaditas, grisines y batatitas fritas",
      "2 por persona: empanadas salteñas + canastitas de verdura y caprese",
    ],
    metadata: {
      unit: "persona",
      incluye: "Recepción, comida ppal., bebida sin alcohol, vajilla, mantelería y servicio de mesa",
    },
  },
  {
    id: "menu-mesa-campo",
    slug: "mesa-de-campo-umami",
    name: 'Mesa de campo "Umami"',
    description:
      "Tabla de fiambres y quesos, dips de distintos sabores (hummus de garbanzo y morrón asado, baba ganush, crema ciboulette, queso crema con verdeo, pasta de aceituna), brusquetas variadas, mini tarteletas de rockefort y nuez y albondiguitas de poroto rojo y garbanzo.",
    priceInCents: 2_200_000,
    currency: "ARS",
    images: [img("mesa-de-campo-umami", "Mesa de campo Umami")],
    available: true,
    maxQuantity: 300,
    category: "Menús",
    type: "package",
    servings: 1,
    includes: [
      "Tabla de fiambres y quesos",
      "Dips de diferentes sabores",
      "Brusquetas variadas + mini tarteletas de rockefort y nuez",
      "Albondiguitas de poroto rojo y garbanzo",
    ],
    metadata: { unit: "persona" },
  },
  {
    id: "menu-isla-saludable",
    slug: "isla-saludable",
    name: "Isla saludable",
    description:
      "Muffins integrales (cacao, remolacha, zuccini, chocolate blanco), bandeja de frutas de estación, barras de cereal, tostadas de pan integral con semillas, dulce casero, queso untable, tabla de quesos, mix de frutos secos, licuados, jugo de naranja exprimido y yogurt casero con granola.",
    priceInCents: 400_000,
    currency: "ARS",
    images: [img("isla-saludable", "Isla saludable de Umami Bites")],
    available: true,
    maxQuantity: 300,
    category: "Menús",
    type: "package",
    servings: 1,
    includes: [
      "Muffins integrales + barras de cereal",
      "Frutas de estación y frutos secos",
      "Yogurt casero con granola y licuados",
      "Tabla de quesos y dulce casero",
    ],
    metadata: { unit: "persona", tipo: "Complemento saludable" },
  },

  // ------------------------------ BRUNCH -----------------------------
  {
    id: "menu-brunch",
    slug: "menu-brunch",
    name: "Brunch",
    description:
      "Salados: chips de pan blanco y negro con fiambres, sanwichitos de miga, scons salados, pizzetas o medialunas calientes y tabla de fiambres. Dulce: alfajorcitos, brownies, apple crumble, lemonies, torta a elección (1 cada 10 personas), muffins variados y fruta de estación.",
    priceInCents: 2_000_000,
    currency: "ARS",
    images: [img("menu-brunch", "Brunch salado y dulce de Umami Bites")],
    available: true,
    maxQuantity: 300,
    category: "Brunch",
    type: "package",
    servings: 1,
    includes: [
      "Salados: chips, sanwichitos de miga, scons, pizzetas / medialunas",
      "Tabla de fiambres",
      "Dulce: alfajorcitos, brownies, lemonies, muffins",
      "Torta a elección (1 cada 10 personas) + fruta de estación",
    ],
    metadata: {
      unit: "persona",
      incluye: "Recepción, comida ppal., bebida sin alcohol, vajilla, mantelería y servicio de mesa",
    },
  },

  // ---------------------------- MESA DULCE ---------------------------
  {
    id: "menu-mesa-dulce",
    slug: "mesa-dulce",
    name: "Mesa dulce",
    description:
      "Tortas a elección (brownie con DDL y merengue, masa nuez sublé y frutos rojos, rogel, lemon pie, carrot cake, havanett, chocotorta, key lime pie), petit fours, budines y muffins variados.",
    priceInCents: 700_000,
    currency: "ARS",
    images: [img("mesa-dulce", "Mesa dulce de Umami Bites")],
    available: true,
    maxQuantity: 300,
    category: "Mesa dulce",
    type: "package",
    servings: 1,
    includes: [
      "Tortas a elección",
      "Petit fours surtidos",
      "Budines y muffins variados",
    ],
    metadata: { unit: "persona" },
  },
  {
    id: "torta-brownie",
    slug: "torta-brownie-ddl",
    name: "Torta Brownie con DDL y merengue",
    description:
      "Torta brownie con dulce de leche, crema y/o merengue. Tamaño entero para mesa dulce o postre.",
    priceInCents: 3_800_000,
    currency: "ARS",
    images: [img("torta-brownie-ddl", "Torta brownie con dulce de leche y merengue")],
    available: true,
    maxQuantity: 10,
    category: "Mesa dulce",
    type: "dish",
    metadata: { unit: "torta" },
  },
  {
    id: "torta-frutos-rojos",
    slug: "torta-frutos-rojos",
    name: "Torta de frutos rojos",
    description: "Bizcocho con crema y abundantes frutos rojos de estación. Torta entera.",
    priceInCents: 4_200_000,
    currency: "ARS",
    images: [img("torta-frutos-rojos", "Torta de frutos rojos")],
    available: true,
    maxQuantity: 10,
    category: "Mesa dulce",
    type: "dish",
    metadata: { unit: "torta" },
  },
  {
    id: "torta-nuez",
    slug: "torta-nuez-ddl",
    name: "Torta de nuez con DDL y crema",
    description:
      "Torta de masa de nuez con dulce de leche y crema. Opción con frutos rojos. Torta entera.",
    priceInCents: 4_200_000,
    currency: "ARS",
    images: [img("torta-nuez-ddl", "Torta de nuez con dulce de leche y crema")],
    available: true,
    maxQuantity: 10,
    category: "Mesa dulce",
    type: "dish",
    metadata: { unit: "torta", opcion: "Con frutos rojos: $48.000" },
  },
  {
    id: "torta-key-lime",
    slug: "key-lime-pie",
    name: "Key lime pie",
    description: "Tarta de lima con base crocante y crema. Torta entera.",
    priceInCents: 4_800_000,
    currency: "ARS",
    images: [img("key-lime-pie", "Key lime pie")],
    available: false,
    maxQuantity: 10,
    category: "Mesa dulce",
    type: "dish",
    metadata: { unit: "torta" },
  },

  // ------------------------------ BEBIDAS ----------------------------
  {
    id: "beb-cerveza",
    slug: "cervezas-artesanales-x6",
    name: "Cervezas artesanales (six pack)",
    description:
      "6 latas a elección de 470 ml. Línea Antares (Playa Grande, Honey Beer, Scotch roja, Kölsch rubia) y línea Kunstmann (Torobayo).",
    priceInCents: 2_900_000,
    currency: "ARS",
    images: [img("cervezas-artesanales-x6", "Cervezas artesanales Antares y Kunstmann")],
    available: true,
    maxQuantity: 40,
    category: "Bebidas",
    type: "dish",
    metadata: { unit: "pack", tierMayor: "$58.000 — 12 latas" },
  },
  {
    id: "beb-vino",
    slug: "vino-malbec-desfachatados",
    name: 'Vino Malbec "Desfachatados"',
    description:
      "Vino mendocino Bodega Pretexto. Malbec de intenso color violeta, notas a frutos rojos oscuros y buena estructura de taninos.",
    priceInCents: 2_400_000,
    currency: "ARS",
    images: [img("vino-malbec-desfachatados", "Vino Malbec Desfachatados Bodega Pretexto")],
    available: true,
    maxQuantity: 24,
    category: "Bebidas",
    type: "dish",
    metadata: { unit: "botella", tierMayor: "$180.000 — la caja (x6)" },
  },
  {
    id: "beb-barra-libre",
    slug: "barra-libre-tragos",
    name: "Barra libre de tragos",
    description:
      "Barra libre de tragos con alcohol: Fernet cola, Campari con naranja, Cuba libre, Gin tonic, Caipirosk, Caipirinha, Daikiris frutales y Gancia. Consultar carta completa.",
    priceInCents: 1_800_000,
    currency: "ARS",
    images: [img("barra-libre-tragos", "Barra libre de tragos con alcohol")],
    available: true,
    maxQuantity: 300,
    category: "Bebidas",
    type: "package",
    servings: 1,
    includes: ["Fernet cola, Campari, Cuba libre, Gin tonic", "Caipirosk, Caipirinha, Daikiris, Gancia"],
    metadata: { unit: "persona" },
  },
];

// =====================================================================
// Fotos reales de Umami Bites (en /public/photos). Sobrescriben los
// placeholders SVG para los ítems con foto disponible. Los ítems sin foto
// limpia (bebidas) conservan su placeholder de marca.
// =====================================================================
// El [0] de cada lista es la foto principal (la que se ve en la grilla):
// está elegida para ser ÚNICA por ítem. Las demás son galería del detalle
// (ahí sí pueden repetirse, no se ven en el listado).
const REAL_PHOTOS: Record<string, string[]> = {
  // Picadas (fotos nuevas 2026)
  "picada-umami": ["picada-umami-1.jpg", "picada-umami-2.jpg", "picada-umami-3.jpg", "picada-umami-4.jpg"],
  "picada-encuentro": ["picada-encuentro-1.jpg", "picada-encuentro-2.jpg", "picada-encuentro-3.jpg"],
  // Empanadas (foto nueva: empanadas + canastitas en tabla)
  "empanadas-saltenas": ["empanadas-1.jpg"],
  "canastitas-surtidas": ["empanadas-1.jpg"],
  // Complementos (fotos nuevas 2026)
  "shots-guacamole-nachos": ["shots-guacamole.jpg"],
  "brusquetas-surtidas": ["p22.jpg"],
  "tarteletas-queso-azul-nuez": ["p03.jpg"],
  "salchichas-copetin-vino": ["p28.jpg"],
  "pinchos-tomate-cherry": ["pinchos-cherry.jpg"],
  "camembert-castanas-miel": ["camembert-castanas.jpg"],
  "flor-de-papas": ["flor-de-papas.jpg"],
  // Menús (cada uno con una tabla/mesa distinta)
  "menu-carnes-desmechadas": ["p16.jpg", "p12.jpg"],
  "menu-todo-sandwich": ["p12.jpg", "p16.jpg"],
  "menu-asado-al-asador": ["p15.jpg", "p11.jpg"],
  "menu-pizza-party": ["p11.jpg", "p03.jpg"],
  "menu-comida-criolla": ["p25.jpg"],
  "menu-encuentro": ["p21.jpg", "p04.jpg"],
  "mesa-de-campo-umami": ["p04.jpg", "p12.jpg"],
  "isla-saludable": ["p24.jpg"],
  // Brunch + mesa dulce + tortas
  "menu-brunch": ["p31.jpg", "p20.jpg"],
  "mesa-dulce": ["mesa-dulce-spread.jpg", "p20.jpg", "p30.jpg", "p33.jpg", "p32.jpg"],
  "torta-brownie-ddl": ["p20.jpg"],
  "torta-frutos-rojos": ["p33.jpg", "p24.jpg"],
  "torta-nuez-ddl": ["p30.jpg", "p20.jpg"],
  "key-lime-pie": ["p32.jpg"],
  // Bebidas (fotos recortadas de la carta real)
  "cervezas-artesanales-x6": ["bev-cervezas.jpg"],
  "vino-malbec-desfachatados": ["bev-vino.jpg"],
  "barra-libre-tragos": ["bev-tragos.jpg"],
};

for (const item of MENU_ITEMS) {
  const photos = REAL_PHOTOS[item.slug];
  if (photos) {
    item.images = photos.map((file) => ({
      url: `/photos/${file}`,
      alt: `${item.name} — Umami Bites Catering`,
    }));
  }
}

// --------------------------- Helpers de datos ---------------------------

export function getAllItems(): MenuItem[] {
  return MENU_ITEMS;
}

export function getItemBySlug(slug: string): MenuItem | undefined {
  return MENU_ITEMS.find((item) => item.slug === slug);
}

export function getFeaturedDishes(limit = 4): MenuItem[] {
  return MENU_ITEMS.filter((i) => i.type === "dish").slice(0, limit);
}

export function getPackages(): MenuItem[] {
  return MENU_ITEMS.filter((i) => i.type === "package");
}

/** Paquetes destacados para la home (picadas + menús estrella). */
export function getFeaturedPackages(limit = 4): MenuItem[] {
  const priority = [
    "picada-umami",
    "menu-asado-al-asador",
    "menu-comida-criolla",
    "picada-encuentro",
  ];
  const map = new Map(MENU_ITEMS.map((i) => [i.slug, i]));
  return priority
    .map((slug) => map.get(slug))
    .filter((i): i is MenuItem => Boolean(i))
    .slice(0, limit);
}

export function getRelatedItems(item: MenuItem, limit = 3): MenuItem[] {
  return MENU_ITEMS.filter(
    (i) => i.category === item.category && i.slug !== item.slug && i.available
  ).slice(0, limit);
}
