"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/require-super-admin";

const promotionSchema = z.object({
  code: z.string().trim().min(4, "El código debe tener al menos 4 caracteres").max(30),
  description: z.string().trim().max(160).optional(),
  durationMonths: z.coerce.number().int().min(1).max(60),
  maxUses: z.coerce.number().int().positive().optional(),
  validUntil: z.string().optional(),
});

function normalizeCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

export async function createPromotionCode(formData: FormData) {
  await requireSuperAdmin();
  const parsed = promotionSchema.parse({
    code: normalizeCode(String(formData.get("code") ?? "")),
    description: formData.get("description") || undefined,
    durationMonths: formData.get("durationMonths"),
    maxUses: formData.get("maxUses") || undefined,
    validUntil: formData.get("validUntil") || undefined,
  });

  const existing = await prisma.promotionCode.findUnique({ where: { code: parsed.code } });
  if (existing) throw new Error("Ya existe un código con ese nombre");

  await prisma.promotionCode.create({
    data: {
      code: parsed.code,
      description: parsed.description || null,
      durationMonths: parsed.durationMonths,
      maxUses: parsed.maxUses ?? null,
      validUntil: parsed.validUntil ? new Date(`${parsed.validUntil}T23:59:59.999-03:00`) : null,
    },
  });
  revalidatePath("/platform/promociones");
}

export async function togglePromotionCode(id: string, active: boolean) {
  await requireSuperAdmin();
  await prisma.promotionCode.update({ where: { id }, data: { active } });
  revalidatePath("/platform/promociones");
}
