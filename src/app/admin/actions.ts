"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireTenantAdmin } from "@/lib/require-admin";
import { sendTestPushToUser } from "@/lib/push";

export async function setStoreOpen(open: boolean) {
  const { tenant } = await requireTenantAdmin();
  await prisma.tenant.update({ where: { id: tenant.id }, data: { storeOpen: open } });
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
}

export async function subscribeToPush(subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) {
  const { session, tenant } = await requireTenantAdmin();
  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: { userId: session.user.id, tenantId: tenant.id, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
    create: {
      userId: session.user.id,
      tenantId: tenant.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });
}

// Devuelve el resultado en vez de tirar error: un throw en un Server Action
// llega al cliente con el mensaje reemplazado por uno genérico en
// producción (medida de seguridad de Next para no filtrar detalles) — y
// "todavía no activaste las notificaciones" es un caso esperado, no una
// falla real, así que necesita llegar con su texto intacto.
export async function sendTestPush(): Promise<{ sent: boolean }> {
  const { session } = await requireTenantAdmin();
  const sent = await sendTestPushToUser(session.user.id, {
    title: "Notificación de prueba",
    body: "Si ves esto, las notificaciones están funcionando 🎉",
    url: "/admin",
  });
  return { sent: sent > 0 };
}
