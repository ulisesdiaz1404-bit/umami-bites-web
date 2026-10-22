// =====================================================================
// Opciones de entrega y cálculo del costo de envío.
//
// El envío se calcula por DISTANCIA desde la dirección del local (la que se
// carga en el panel → Configuración) hasta la dirección del cliente:
//
//     costo = max( MÍNIMO , redondear( km × $/km ) )
//
// Los km son por ruta estimada (línea recta × ROAD_FACTOR). El precio por km
// y el mínimo también se editan desde el panel.
//
// Los importes están en centavos de ARS (estándar del proyecto).
// =====================================================================

/** Coordenadas por defecto del local (Bella Vista, San Miguel) si todavía no
 *  se cargó/ubicó una dirección en la configuración. */
export const ORIGIN_COORDS = { lat: -34.5628, lng: -58.6819 };

/** ID de la opción "envío a domicilio" (precio calculado por dirección). */
export const ADDRESS_ZONE_ID = "direccion";

/** Factor para aproximar la distancia por ruta a partir de la recta. */
export const ROAD_FACTOR = 1.3;

export interface LatLng {
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

/** Distancia de ruta estimada entre el local y un destino (recta × factor). */
export function roadKm(origin: LatLng, dest: LatLng): number {
  return haversineKm(origin, dest) * ROAD_FACTOR;
}

/** Redondeo del envío al múltiplo más cercano (centavos). $100. */
const ROUND_TO_CENTS = 10_000;

/** Calcula el costo de envío para una distancia dada, con mínimo y redondeo. */
export function shippingForKm(km: number, perKmInCents: number, minInCents: number): number {
  const raw = km * perKmInCents;
  const rounded = Math.round(raw / ROUND_TO_CENTS) * ROUND_TO_CENTS;
  return Math.max(minInCents, rounded);
}

export type ZoneKind = "pickup" | "delivery" | "consult";

export interface DeliveryZone {
  id: string;
  label: string;
  kind: ZoneKind;
  /** Distancia por ruta estimada desde el local (solo delivery). */
  km?: number;
  /** Costo del envío en centavos (0 en retiro / a coordinar). */
  priceInCents: number;
}

/** Envío a domicilio: el precio sale de la dirección del cliente. */
export const ADDRESS_ZONE: DeliveryZone = {
  id: ADDRESS_ZONE_ID,
  label: "Envío a domicilio (se calcula por tu dirección)",
  kind: "delivery",
  priceInCents: 0,
};

/** Opción de retiro en el local (sin cargo). */
export const PICKUP_ZONE: DeliveryZone = {
  id: "retiro",
  label: "Retiro en el local (sin cargo)",
  kind: "pickup",
  priceInCents: 0,
};

/** Fallback si la dirección no se pudo ubicar o queda lejos: se coordina por WhatsApp. */
export const CONSULT_ZONE: DeliveryZone = {
  id: "otra",
  label: "Coordinar el envío por WhatsApp",
  kind: "consult",
  priceInCents: 0,
};

/** Todas las opciones para el selector. */
export const ALL_DELIVERY_OPTIONS: DeliveryZone[] = [ADDRESS_ZONE, PICKUP_ZONE, CONSULT_ZONE];

export function getDeliveryOption(id?: string): DeliveryZone | undefined {
  if (!id) return undefined;
  return ALL_DELIVERY_OPTIONS.find((z) => z.id === id);
}
