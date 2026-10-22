import { NextResponse } from "next/server";
import { ORIGIN_COORDS, roadKm, shippingForKm } from "@/lib/data/delivery-zones";
import { getSettings } from "@/lib/data/settings.server";
import { geocodeAddress, reverseGeocode, GeoUpstreamError, type GeoHit } from "@/lib/geo/nominatim";

// =====================================================================
// Cotización de envío. Recibe la DIRECCIÓN escrita por el cliente o su
// UBICACIÓN (lat/lng del celular), mide la distancia por ruta estimada desde
// la dirección del local (Configuración) y aplica el precio por km.
// Geocoding: Nominatim (ver lib/geo/nominatim.ts).
// =====================================================================

export const runtime = "nodejs";

// Más lejos que esto probablemente sea un geocoding erróneo o fuera de zona.
const MAX_ROAD_KM = 90;

const isCoord = (v: unknown, max: number): v is number =>
  typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= max;

export async function POST(req: Request) {
  let body: { address?: unknown; lat?: unknown; lng?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    // body inválido → cae en la validación de abajo
  }
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const byLocation = isCoord(body.lat, 90) && isCoord(body.lng, 180);

  if (!byLocation && address.length < 5) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
  }

  let hit: GeoHit | null;
  try {
    hit = byLocation
      ? await reverseGeocode(body.lat as number, body.lng as number)
      : await geocodeAddress(address);
  } catch (e) {
    if (e instanceof GeoUpstreamError) {
      return NextResponse.json({ ok: false, reason: "upstream" }, { status: 502 });
    }
    throw e;
  }
  if (!hit) return NextResponse.json({ ok: false, reason: "notfound" });

  const settings = await getSettings();
  const origin =
    settings.originLat != null && settings.originLng != null
      ? { lat: settings.originLat, lng: settings.originLng }
      : ORIGIN_COORDS;

  const km = roadKm(origin, hit);
  if (km > MAX_ROAD_KM) {
    return NextResponse.json({ ok: false, reason: "far", km: Math.round(km) });
  }

  return NextResponse.json({
    ok: true,
    km: Math.round(km * 10) / 10,
    priceInCents: shippingForKm(km, settings.shippingPerKmInCents, settings.shippingInCents),
    label: hit.label,
    matched: hit.matched,
  });
}
