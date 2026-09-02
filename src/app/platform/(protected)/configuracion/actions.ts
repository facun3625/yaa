"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { PLATFORM_BILLING_SETTINGS_ID } from "@/lib/platform-billing";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/require-super-admin";

const whatsappSchema = z.object({
  enabled: z.boolean(),
  number: z.string().trim().transform((value) => value.replace(/\D/g, "")).pipe(
    z.string().min(8, "Ingresá un número completo, incluyendo código de país").max(15, "El número es demasiado largo"),
  ),
  message: z.string().trim().max(500, "El mensaje no puede superar los 500 caracteres"),
});

export async function saveMarketingWhatsapp(formData: FormData) {
  await requireSuperAdmin();
  const parsed = whatsappSchema.parse({
    enabled: formData.get("enabled") === "true",
    number: formData.get("number"),
    message: formData.get("message"),
  });

  await prisma.platformBillingSettings.upsert({
    where: { id: PLATFORM_BILLING_SETTINGS_ID },
    create: {
      id: PLATFORM_BILLING_SETTINGS_ID,
      marketingWhatsappEnabled: parsed.enabled,
      marketingWhatsappNumber: parsed.number,
      marketingWhatsappMessage: parsed.message || null,
    },
    update: {
      marketingWhatsappEnabled: parsed.enabled,
      marketingWhatsappNumber: parsed.number,
      marketingWhatsappMessage: parsed.message || null,
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/platform/configuracion");
}
