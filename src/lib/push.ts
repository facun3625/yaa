import webpush from "web-push";
import { prisma } from "@/lib/prisma";

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

let vapidConfigured = false;

function ensureVapidConfigured(): boolean {
  if (vapidConfigured) return true;
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
    console.error("Push: faltan VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY/VAPID_SUBJECT en el entorno");
    return false;
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  vapidConfigured = true;
  return true;
}

async function sendToSubscriptions(
  subscriptions: { endpoint: string; p256dh: string; auth: string }[],
  payload: PushPayload,
): Promise<number> {
  if (!ensureVapidConfigured() || subscriptions.length === 0) return 0;

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
      ).catch((error) => {
        throw { endpoint: sub.endpoint, error };
      }),
    ),
  );

  const expiredEndpoints = results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => r.reason as { endpoint: string; error: { statusCode?: number } })
    .filter(({ error }) => error?.statusCode === 404 || error?.statusCode === 410)
    .map(({ endpoint }) => endpoint);

  if (expiredEndpoints.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { endpoint: { in: expiredEndpoints } } });
  }

  return results.filter((r) => r.status === "fulfilled").length;
}

// Avisa a todos los admins de una tienda que instalaron el panel como PWA.
// Nunca tira: cada llamada ya va envuelta en su propio try/catch en el
// caller (ver checkout/actions.ts), un push que falla no puede romper nada.
export async function sendPushToTenantAdmins(tenantId: string, payload: PushPayload): Promise<void> {
  const subscriptions = await prisma.pushSubscription.findMany({ where: { tenantId } });
  await sendToSubscriptions(subscriptions, payload);
}

// Para el botón "Enviar prueba" en Configuración — a diferencia de la
// anterior, esta sí devuelve cuántas suscripciones recibieron el mensaje,
// para poder avisar "todavía no activaste las notificaciones en este
// dispositivo" si da 0, en vez de fallar en silencio.
export async function sendTestPushToUser(userId: string, payload: PushPayload): Promise<number> {
  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
  return sendToSubscriptions(subscriptions, payload);
}
