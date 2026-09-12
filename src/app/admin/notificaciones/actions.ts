"use server";

import { z } from "zod";

import { requireTenantAdmin } from "@/lib/require-admin";
import { sendPushToTenantCustomers } from "@/lib/push";
import { isRateLimited, recordFailure, PUSH_BROADCAST_RULE } from "@/lib/rate-limit";

const broadcastSchema = z.object({
  title: z.string().trim().min(1, "Poné un título").max(60, "Máximo 60 caracteres"),
  body: z.string().trim().min(1, "Poné un mensaje").max(160, "Máximo 160 caracteres"),
  url: z.string().trim().optional(),
});

// Devuelve { sent } en vez de tirar en el caso "0 suscriptos" — un throw en
// una Server Action llega al cliente con el mensaje genérico en prod, y acá
// no es una falla real sino algo que el admin necesita ver tal cual.
export async function sendCustomerBroadcast(formData: FormData): Promise<{ sent: number }> {
  const { tenant } = await requireTenantAdmin();
  const parsed = broadcastSchema.parse({
    title: formData.get("title"),
    body: formData.get("body"),
    url: formData.get("url") || undefined,
  });

  const rateLimitKey = `push-broadcast:${tenant.id}`;
  if (await isRateLimited(rateLimitKey, PUSH_BROADCAST_RULE)) {
    throw new Error("Ya mandaste varias campañas esta hora — probá de nuevo más tarde.");
  }
  await recordFailure(rateLimitKey);

  const sent = await sendPushToTenantCustomers(tenant.id, {
    title: parsed.title,
    body: parsed.body,
    url: parsed.url || "/",
  });

  return { sent };
}
