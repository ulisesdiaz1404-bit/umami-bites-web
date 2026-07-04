import { NextResponse } from "next/server";
import { roadKmFromOrigin, shippingForKm } from "@/lib/data/delivery-zones";

// =====================================================================
// Cotización de envío por DIRECCIÓN EXACTA.
// Geocodifica con Nominatim (OpenStreetMap): gratis, sin API key. Corre en el
// server (no toca el CSP del navegador). Convierte la dirección en coordenadas,
// mide la distancia por ruta estimada a Bella Vista y aplica la tarifa por km.
//
// Política de uso de Nominatim que respetamos:
//  - User-Agent identificando la app (obligatorio).
//  - Cacheo de resultados (revalidate 7 días) → menos requests.
//  - Un pedido por acción del usuario (no en bucle).
// =====================================================================

export const runtime = "nodejs";

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const USER_AGENT =
  "UmamiBitesCatering/1.0 (catering en Buenos Aires; IG @umami.bites.catering)";

// Más lejos que esto probablemente sea un geocoding erróneo o fuera de zona.
const MAX_ROAD_KM = 90;

export async function POST(req: Request) {
  let address = "";
  try {
    const body = await req.json();
    address = typeof body?.address === "string" ? body.address : "";
  } catch {
    // body inválido → cae en la validación de abajo
  }
  address = address.trim();

  if (address.length < 5) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
  }

  // Anclamos a Argentina para mejorar la precisión en el conurbano.
  const query = /argentina/i.test(address)
    ? address
    : `${address}, Provincia de Buenos Aires, Argentina`;
  const url =
    `${NOMINATIM}?format=jsonv2&limit=1&countrycodes=ar&addressdetails=1` +
    `&q=${encodeURIComponent(query)}`;

  let results: Array<{
    lat?: string;
    lon?: string;
    display_name?: string;
    address?: Record<string, string>;
  }> = [];
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "es" },
      next: { revalidate: 604800 }, // 7 días
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, reason: "upstream" }, { status: 502 });
    }
    results = await res.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "upstream" }, { status: 502 });
  }

  const hit = results[0];
  const lat = hit ? parseFloat(hit.lat ?? "") : NaN;
  const lng = hit ? parseFloat(hit.lon ?? "") : NaN;
  if (!hit || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ ok: false, reason: "notfound" });
  }

  const km = roadKmFromOrigin({ lat, lng });
  if (km > MAX_ROAD_KM) {
    return NextResponse.json({ ok: false, reason: "far", km: Math.round(km) });
  }

  const a = hit.address ?? {};
  const label =
    a.city ||
    a.town ||
    a.suburb ||
    a.village ||
    a.city_district ||
    a.county ||
    hit.display_name?.split(",")[1]?.trim() ||
    "tu dirección";

  return NextResponse.json({
    ok: true,
    km: Math.round(km),
    priceInCents: shippingForKm(km),
    label,
    matched: hit.display_name ?? "",
  });
}
