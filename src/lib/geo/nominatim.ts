// =====================================================================
// Geocoding con Nominatim (OpenStreetMap): gratis, sin API key. SOLO servidor
// (no toca el CSP del navegador).
//
// Política de uso de Nominatim que respetamos:
//  - User-Agent identificando la app (obligatorio).
//  - Cacheo de resultados (revalidate 7 días) → menos requests.
//  - Un pedido por acción del usuario (no autocompletado mientras escribe).
// =====================================================================

const NOMINATIM = "https://nominatim.openstreetmap.org";
const USER_AGENT =
  "UmamiBitesCatering/1.0 (catering en Buenos Aires; IG @umami.bites.catering)";

export interface GeoHit {
  lat: number;
  lng: number;
  /** Localidad/barrio legible para mostrar ("Envío a …"). */
  label: string;
  /** Dirección completa que encontró Nominatim. */
  matched: string;
}

interface NominatimResult {
  lat?: string;
  lon?: string;
  display_name?: string;
  address?: Record<string, string>;
}

/** Error de red / Nominatim caído (distinto de "no encontrado"). */
export class GeoUpstreamError extends Error {}

async function nominatim(path: string): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(`${NOMINATIM}${path}`, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "es" },
      next: { revalidate: 604800 }, // 7 días
    });
  } catch {
    throw new GeoUpstreamError("network");
  }
  if (!res.ok) throw new GeoUpstreamError(String(res.status));
  return res.json();
}

function toHit(r: NominatimResult | undefined): GeoHit | null {
  const lat = r ? parseFloat(r.lat ?? "") : NaN;
  const lng = r ? parseFloat(r.lon ?? "") : NaN;
  if (!r || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const a = r.address ?? {};
  const label =
    a.city ||
    a.town ||
    a.suburb ||
    a.village ||
    a.city_district ||
    a.county ||
    r.display_name?.split(",")[1]?.trim() ||
    "tu dirección";
  return { lat, lng, label, matched: r.display_name ?? "" };
}

/** Saca abreviaturas que Nominatim no entiende ("Av. Pres. Perón" → "Perón"). */
function simplify(address: string): string {
  return address
    .replace(/\b(av|avda|pres|presidente|gral|general|dr|ing|cnel|tte|pje|bv|bvd)\b\.?/gi, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Dirección → coordenadas (solo Argentina). Si no la encuentra tal cual,
 *  reintenta una vez sin abreviaturas y anclada a Buenos Aires. */
export async function geocodeAddress(address: string): Promise<GeoHit | null> {
  const simple = simplify(address);
  const attempts = [
    address,
    /buenos aires|caba|capital/i.test(simple) ? simple : `${simple}, Buenos Aires`,
  ].filter((q, i, arr) => arr.indexOf(q) === i);

  for (const [i, query] of attempts.entries()) {
    if (i > 0) await wait(1000); // máx. 1 request/seg (política de Nominatim)
    const data = (await nominatim(
      `/search?format=jsonv2&limit=1&countrycodes=ar&addressdetails=1&q=${encodeURIComponent(query)}`
    )) as NominatimResult[];
    const hit = toHit(data[0]);
    if (hit) return hit;
  }
  return null;
}

/** Coordenadas (ubicación del celular) → dirección legible. */
export async function reverseGeocode(lat: number, lng: number): Promise<GeoHit | null> {
  const data = (await nominatim(
    `/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${lat}&lon=${lng}`
  )) as NominatimResult & { error?: string };
  if (data.error) return null;
  // En reverse nos quedamos con las coordenadas reales del cliente.
  const hit = toHit(data);
  return hit ? { ...hit, lat, lng } : null;
}
