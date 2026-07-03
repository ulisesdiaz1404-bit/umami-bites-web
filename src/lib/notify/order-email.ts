import { formatPrice, formatUnit } from "@/lib/utils";
import { PAYMENT_LABELS, type PaymentMethod } from "@/lib/whatsapp-order";

// =====================================================================
// Aviso por email al dueño cuando entra un pedido nuevo (vía Resend).
// Solo servidor. Usa la API REST de Resend con fetch (sin dependencias).
// Si faltan las env vars, no hace nada (el pedido igual se guarda y viaja
// por WhatsApp): RESEND_API_KEY + ORDER_NOTIFY_EMAIL son obligatorias.
//   RESEND_API_KEY   → clave de https://resend.com
//   ORDER_NOTIFY_EMAIL → a dónde llega el aviso (ej. mail del dueño)
//   ORDER_NOTIFY_FROM  → remitente (default: onboarding@resend.dev, sirve
//                        para probar sin dominio verificado)
// =====================================================================

interface OrderEmailItem {
  name: string;
  quantity: number;
  unit?: string;
  priceInCents: number;
}

export interface OrderEmailData {
  customerName: string;
  customerPhone: string;
  address: string;
  notes?: string | null;
  deliveryDate?: string | null;
  payment: PaymentMethod | string;
  items: OrderEmailItem[];
  subtotalInCents: number;
  shippingInCents: number;
  totalInCents: number;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function fmtDate(iso?: string | null): string | null {
  if (!iso) return null;
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function renderHtml(o: OrderEmailData): string {
  const rows = o.items
    .map(
      (it) => `
      <tr>
        <td style="padding:6px 0;color:#3a2c1a">${esc(String(it.quantity))} ${esc(
          formatUnit(it.quantity, it.unit)
        )} — ${esc(it.name)}</td>
        <td style="padding:6px 0;text-align:right;color:#3a2c1a;white-space:nowrap">${formatPrice(
          it.priceInCents * it.quantity,
          "ARS"
        )}</td>
      </tr>`
    )
    .join("");

  const date = fmtDate(o.deliveryDate);
  const paymentLabel =
    PAYMENT_LABELS[o.payment as PaymentMethod] ?? String(o.payment);
  const waDigits = o.customerPhone.replace(/\D/g, "");
  const waFull = waDigits.startsWith("54") ? waDigits : `54${waDigits}`;

  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#faf5ec;padding:24px">
    <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #ecdfca;border-radius:16px;overflow:hidden">
      <div style="background:#4a361f;padding:18px 24px">
        <span style="color:#f4c96b;font-size:18px;font-weight:600">🍽️ Nuevo pedido — Umami Bites</span>
      </div>
      <div style="padding:24px">
        <p style="margin:0 0 4px;color:#7a6547;font-size:13px">Cliente</p>
        <p style="margin:0 0 14px;color:#2a2013;font-size:16px;font-weight:600">${esc(
          o.customerName
        )}</p>

        <table style="width:100%;font-size:14px;color:#3a2c1a;border-collapse:collapse">
          <tr><td style="padding:3px 0">📞 Teléfono</td><td style="padding:3px 0;text-align:right">
            <a href="https://wa.me/${waFull}" style="color:#2f8f4e;text-decoration:none">${esc(
    o.customerPhone
  )}</a></td></tr>
          <tr><td style="padding:3px 0">📍 Dirección</td><td style="padding:3px 0;text-align:right">${esc(
            o.address
          )}</td></tr>
          ${
            date
              ? `<tr><td style="padding:3px 0">📅 Entrega</td><td style="padding:3px 0;text-align:right;text-transform:capitalize">${esc(
                  date
                )}</td></tr>`
              : ""
          }
          <tr><td style="padding:3px 0">💳 Pago</td><td style="padding:3px 0;text-align:right">${esc(
            paymentLabel
          )}</td></tr>
        </table>

        ${
          o.notes?.trim()
            ? `<p style="margin:14px 0 0;padding:10px 12px;background:#faf5ec;border-radius:8px;color:#5c4a30;font-size:13px">📝 ${esc(
                o.notes.trim()
              )}</p>`
            : ""
        }

        <hr style="border:none;border-top:1px solid #ecdfca;margin:18px 0" />

        <p style="margin:0 0 8px;color:#7a6547;font-size:13px">Pedido</p>
        <table style="width:100%;font-size:14px;border-collapse:collapse">${rows}</table>

        <hr style="border:none;border-top:1px solid #ecdfca;margin:14px 0" />
        <table style="width:100%;font-size:14px;color:#5c4a30;border-collapse:collapse">
          <tr><td style="padding:2px 0">Subtotal</td><td style="padding:2px 0;text-align:right">${formatPrice(
            o.subtotalInCents,
            "ARS"
          )}</td></tr>
          <tr><td style="padding:2px 0">Envío</td><td style="padding:2px 0;text-align:right">${formatPrice(
            o.shippingInCents,
            "ARS"
          )}</td></tr>
          <tr><td style="padding:6px 0;font-weight:700;color:#2a2013;font-size:16px">Total</td>
              <td style="padding:6px 0;text-align:right;font-weight:700;color:#2a2013;font-size:16px">${formatPrice(
                o.totalInCents,
                "ARS"
              )}</td></tr>
        </table>

        <a href="https://wa.me/${waFull}" style="display:inline-block;margin-top:18px;background:#2f8f4e;color:#fff;text-decoration:none;padding:11px 20px;border-radius:999px;font-weight:600;font-size:14px">💬 Responder por WhatsApp</a>
      </div>
    </div>
    <p style="max-width:520px;margin:14px auto 0;color:#a2906f;font-size:11px;text-align:center">Aviso automático del panel de Umami Bites.</p>
  </div>`;
}

/**
 * Manda el email de pedido nuevo. No lanza: cualquier error se traga y se
 * loguea, para que un fallo del mail nunca rompa la creación del pedido.
 * Devuelve true si se envió, false si no había config o falló.
 */
export async function sendNewOrderEmail(o: OrderEmailData): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_NOTIFY_EMAIL;
  if (!apiKey || !to) return false; // no configurado → no-op silencioso

  const from = process.env.ORDER_NOTIFY_FROM || "Umami Bites <onboarding@resend.dev>";
  const total = formatPrice(o.totalInCents, "ARS");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: to.split(",").map((s) => s.trim()).filter(Boolean),
        subject: `🍽️ Nuevo pedido de ${o.customerName} — ${total}`,
        html: renderHtml(o),
      }),
    });
    if (!res.ok) {
      console.error("[order-email] Resend respondió", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[order-email] error enviando:", err);
    return false;
  }
}
