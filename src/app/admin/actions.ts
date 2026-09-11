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

export async function sendTestPush() {
  const { session } = await requireTenantAdmin();
  const sent = await sendTestPushToUser(session.user.id, {
    title: "Notificación de prueba",
    body: "Si ves esto, las notificaciones están funcionando 🎉",
    url: "/admin",
  });
  if (sent === 0) {
    throw new Error("Todavía no activaste las notificaciones en este dispositivo — instalá la app y activalas primero.");
  }
}
