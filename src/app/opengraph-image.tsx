import { ImageResponse } from "next/og";

// Imagen que aparece al compartir el link (WhatsApp, Instagram, etc.).
// Se genera sola en 1200×630. Next la usa como og:image y twitter:image.
export const alt = "Umami Bites Catering — Catering para eventos en Buenos Aires";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(120% 120% at 50% 0%, #1e160e 0%, #0d0703 60%)",
          color: "#FBF6EC",
          fontFamily: "sans-serif",
          padding: "80px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#d59b52",
            marginBottom: 24,
          }}
        >
          Catering premium
        </div>
        <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.05 }}>
          Umami Bites Catering
        </div>
        <div
          style={{
            fontSize: 40,
            color: "#e9dfd0",
            marginTop: 28,
            maxWidth: 900,
          }}
        >
          Catering para eventos en Buenos Aires y GBA
        </div>
        <div style={{ fontSize: 30, color: "#b9a892", marginTop: 40 }}>
          Casamientos · Cumpleaños · Corporativos · Picadas · Menús · Mesa dulce
        </div>
      </div>
    ),
    { ...size }
  );
}
