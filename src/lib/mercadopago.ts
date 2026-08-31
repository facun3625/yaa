import { createHmac, timingSafeEqual } from "node:crypto";

// Cliente contra la API REST de MercadoPago. Sin SDK a propósito: son tres
// llamadas HTTP y así no quedamos atados a las versiones de un paquete
// externo en algo que mueve plata.
const MP_API = "https://api.mercadopago.com";

// La app apunta a Argentina (es-AR en todos los formatos, MP Argentina).
export const MP_CURRENCY = "ARS";

export type MpPreferenceItem = {
  title: string;
  quantity: number;
  unitPrice: number;
};

export type MpPreference = {
  id: string;
  initPoint: string;
};

async function mpFetch(accessToken: string, path: string, init?: RequestInit) {
  const res = await fetch(`${MP_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    // El cuerpo del error de MP suele explicar bien qué falta (credencial
    // inválida, monto en 0, back_urls mal formadas...) — lo propagamos en vez
    // de tragarlo, si no debuggear esto es a ciegas.
    const body = await res.text().catch(() => "");
    throw new Error(`MercadoPago respondió ${res.status}: ${body.slice(0, 500)}`);
  }
  return res.json();
}

// Crea el "link de pago" para un pedido. `externalReference` es lo que nos
// vuelve en el webhook para saber de qué pedido se trata — no dependemos del
// host ahí (ver src/app/api/webhooks/mercadopago/route.ts).
export async function createPreference(
  accessToken: string,
  {
    items,
    externalReference,
    notificationUrl,
    backUrl,
    payerEmail,
  }: {
    items: MpPreferenceItem[];
    externalReference: string;
    notificationUrl: string;
    backUrl: string;
    payerEmail?: string | null;
  },
): Promise<MpPreference> {
  const data = await mpFetch(accessToken, "/checkout/preferences", {
    method: "POST",
    body: JSON.stringify({
      items: items.map((i) => ({
        title: i.title,
        quantity: i.quantity,
        unit_price: i.unitPrice,
        currency_id: MP_CURRENCY,
      })),
      external_reference: externalReference,
      notification_url: notificationUrl,
      back_urls: { success: backUrl, failure: backUrl, pending: backUrl },
      // Vuelve solo a la tienda cuando el pago se aprueba, sin que tenga que
      // tocar "volver al sitio". MP exige que back_urls.success sea https
      // para esto, así que en local (http) esto se omite — ver el llamador.
      auto_return: backUrl.startsWith("https://") ? "approved" : undefined,
    }),
  });

  return { id: String(data.id), initPoint: String(data.init_point) };
}

export type MpPayment = {
  id: string;
  status: string;
  externalReference: string | null;
};

// El webhook NO confía en lo que dice el POST: solo trae un id, y con eso
// vamos a preguntarle a MP el estado real del pago.
export async function getPayment(accessToken: string, paymentId: string): Promise<MpPayment> {
  const data = await mpFetch(accessToken, `/v1/payments/${paymentId}`);
  return {
    id: String(data.id),
    status: String(data.status),
    externalReference: data.external_reference ? String(data.external_reference) : null,
  };
}

// Verifica que una notificación venga de verdad de MercadoPago.
//
// Sin esto, cualquiera que sepa la URL del webhook puede mandar un POST
// diciendo "este pedido está pagado" y llevarse la mercadería gratis.
//
// MP manda un header `x-signature` con la forma "ts=<...>,v1=<hmac>", y el
// hmac es SHA256 sobre "id:<dataId>;request-id:<requestId>;ts:<ts>;" con la
// clave secreta de la integración. Si algún dato del template no viene en la
// notificación, se omite ese tramo.
export function verifyWebhookSignature({
  signatureHeader,
  requestId,
  dataId,
  secret,
}: {
  signatureHeader: string | null;
  requestId: string | null;
  dataId: string | null;
  secret: string;
}): boolean {
  if (!signatureHeader || !dataId) return false;

  const parts = new Map(
    signatureHeader.split(",").map((chunk) => {
      const [k, ...rest] = chunk.trim().split("=");
      return [k.trim(), rest.join("=").trim()] as const;
    }),
  );
  const ts = parts.get("ts");
  const received = parts.get("v1");
  if (!ts || !received) return false;

  let manifest = `id:${dataId};`;
  if (requestId) manifest += `request-id:${requestId};`;
  manifest += `ts:${ts};`;

  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  // Comparación en tiempo constante: comparar con === filtra información
  // sobre cuántos caracteres acertó quien lo intente.
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
