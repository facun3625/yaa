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

const setupServiceSchema = z.object({
  enabled: z.boolean(),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  steps: z
    .array(z.string().trim().min(1))
    .max(8, "No más de 8 pasos"),
});

export async function saveSetupServiceSettings(formData: FormData) {
  await requireSuperAdmin();
  let steps: unknown;
  try {
    steps = JSON.parse(String(formData.get("steps") ?? "[]"));
  } catch {
    throw new Error("Pasos inválidos");
  }

  const parsed = setupServiceSchema.parse({
    enabled: formData.get("enabled") === "true",
    price: formData.get("price"),
    steps,
  });

  await prisma.platformBillingSettings.upsert({
    where: { id: PLATFORM_BILLING_SETTINGS_ID },
    create: {
      id: PLATFORM_BILLING_SETTINGS_ID,
      setupServiceEnabled: parsed.enabled,
      setupServicePrice: parsed.price,
      setupServiceSteps: parsed.steps,
    },
    update: {
      setupServiceEnabled: parsed.enabled,
      setupServicePrice: parsed.price,
      setupServiceSteps: parsed.steps,
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/platform/configuracion");
}
