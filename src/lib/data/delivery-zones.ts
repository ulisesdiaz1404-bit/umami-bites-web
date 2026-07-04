// =====================================================================
// Zonas de entrega y cálculo del costo de envío.
//
// El envío se calcula por DISTANCIA estimada a la base (Bella Vista, San
// Miguel): a más km, más caro. Cada localidad tiene una distancia de
// referencia por ruta (editable). Fórmula:
//
//     costo = max( MÍNIMO , redondear( km × $/km ) )
//
// No usamos geocoding de dirección exacta (requeriría una API de mapas paga
// y abrir el CSP): el cliente elige su localidad y el precio sale al instante.
// Incluye la opción de RETIRO en el local (sin cargo).
//
// Los importes están en centavos de ARS (estándar del proyecto).
// =====================================================================

/** Origen de los envíos (para mostrar/contexto). */
export const DELIVERY_ORIGIN = "Bella Vista, San Miguel";

/** Coordenadas de la base (Bella Vista, San Miguel, Buenos Aires). */
export const ORIGIN_COORDS = { lat: -34.5628, lng: -58.6819 };

/** ID de la zona sintética "cálculo por dirección exacta" (Nominatim). */
export const ADDRESS_ZONE_ID = "direccion";

/** Factor para aproximar la distancia por ruta a partir de la recta. */
export const ROAD_FACTOR = 1.3;

interface LatLng {
  lat: number;
  lng: number;
}

/** Distancia en km en línea recta (haversine) entre dos coordenadas. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371; // radio terrestre en km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Distancia de ruta estimada desde la base a un destino (recta × factor). */
export function roadKmFromOrigin(dest: LatLng): number {
  return haversineKm(ORIGIN_COORDS, dest) * ROAD_FACTOR;
}

/** Precio por kilómetro (centavos ARS). $85/km. */
export const RATE_PER_KM_IN_CENTS = 8_500;

/** Envío mínimo (centavos ARS). $1.500 — cubre la zona más cercana. */
export const MIN_SHIPPING_IN_CENTS = 150_000;

/** Redondeo del envío al múltiplo más cercano (centavos). $100. */
const ROUND_TO_CENTS = 10_000;

/** Calcula el costo de envío para una distancia dada, con mínimo y redondeo. */
export function shippingForKm(km: number): number {
  const raw = km * RATE_PER_KM_IN_CENTS;
  const rounded = Math.round(raw / ROUND_TO_CENTS) * ROUND_TO_CENTS;
  return Math.max(MIN_SHIPPING_IN_CENTS, rounded);
}

export type ZoneKind = "pickup" | "delivery" | "consult";

export interface DeliveryZone {
  id: string;
  label: string;
  kind: ZoneKind;
  /** Distancia de referencia a Bella Vista (solo delivery). */
  km?: number;
  /** Costo del envío en centavos (0 en retiro / a coordinar). */
  priceInCents: number;
}

// Localidades servidas con su distancia estimada por ruta a Bella Vista (km).
// AFINAR con el dueño si algún valor no representa el costo real.
const RAW_ZONES: { id: string; label: string; km: number }[] = [
  { id: "san-miguel", label: "San Miguel / Bella Vista", km: 0 },
  { id: "muniz", label: "Muñiz", km: 4 },
  { id: "jose-c-paz", label: "José C. Paz", km: 6 },
  { id: "hurlingham", label: "Hurlingham", km: 12 },
  { id: "ituzaingo", label: "Ituzaingó", km: 16 },
  { id: "san-miguel-oeste", label: "Del Viso", km: 16 },
  { id: "moron", label: "Morón", km: 18 },
  { id: "san-isidro", label: "San Isidro", km: 18 },
  { id: "pilar", label: "Pilar", km: 22 },
  { id: "san-fernando", label: "San Fernando", km: 22 },
  { id: "vicente-lopez", label: "Vicente López", km: 22 },
  { id: "ramos-mejia", label: "Ramos Mejía", km: 22 },
  { id: "tigre", label: "Tigre", km: 24 },
  { id: "san-justo", label: "San Justo (La Matanza)", km: 25 },
  { id: "caba", label: "CABA (Capital Federal)", km: 18 },
  { id: "avellaneda", label: "Avellaneda", km: 35 },
  { id: "lanus", label: "Lanús", km: 38 },
  { id: "lomas", label: "Lomas de Zamora", km: 42 },
  { id: "quilmes", label: "Quilmes", km: 47 },
];

/** Opción de retiro en el local (sin cargo). */
export const PICKUP_ZONE: DeliveryZone = {
  id: "retiro",
  label: "Retiro en el local (sin cargo)",
  kind: "pickup",
  priceInCents: 0,
};

/** Fallback para localidades fuera de la lista: se coordina por WhatsApp. */
export const CONSULT_ZONE: DeliveryZone = {
  id: "otra",
  label: "Otra localidad (coordinamos por WhatsApp)",
  kind: "consult",
  priceInCents: 0,
};

/** Zonas de envío calculadas, ordenadas de más barata a más cara. */
export const DELIVERY_ZONES: DeliveryZone[] = RAW_ZONES.map((z) => ({
  id: z.id,
  label: z.label,
  kind: "delivery" as const,
  km: z.km,
  priceInCents: shippingForKm(z.km),
})).sort((a, b) => a.priceInCents - b.priceInCents || a.label.localeCompare(b.label));

/** Todas las opciones para el selector: retiro + envíos + "otra". */
export const ALL_DELIVERY_OPTIONS: DeliveryZone[] = [
  PICKUP_ZONE,
  ...DELIVERY_ZONES,
  CONSULT_ZONE,
];

export function getDeliveryOption(id?: string): DeliveryZone | undefined {
  if (!id) return undefined;
  return ALL_DELIVERY_OPTIONS.find((z) => z.id === id);
}
