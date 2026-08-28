"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/require-super-admin";

const planSchema = z.object({
  name: z.string().min(1, "Ingresá un nombre"),
  priceMonthly: z.coerce.number().nonnegative("El precio no puede ser negativo"),
  maxProducts: z.coerce.number().int().positive().optional(),
  maxOrdersPerMonth: z.coerce.number().int().positive().optional(),
  allowCustomDomain: z.boolean(),
  description: z.string().optional(),
});

export async function createPlan(formData: FormData) {
  await requireSuperAdmin();
  const parsed = planSchema.parse({
    name: formData.get("name"),
    priceMonthly: formData.get("priceMonthly"),
    maxProducts: formData.get("maxProducts") || undefined,
    maxOrdersPerMonth: formData.get("maxOrdersPerMonth") || undefined,
    allowCustomDomain: formData.get("allowCustomDomain") === "true",
    description: formData.get("description") || undefined,
  });

  const last = await prisma.plan.findFirst({ orderBy: { order: "desc" } });

  await prisma.plan.create({
    data: {
      name: parsed.name,
      priceMonthly: parsed.priceMonthly,
      maxProducts: parsed.maxProducts ?? null,
      maxOrdersPerMonth: parsed.maxOrdersPerMonth ?? null,
      allowCustomDomain: parsed.allowCustomDomain,
      description: parsed.description?.trim() || null,
      order: (last?.order ?? -1) + 1,
    },
  });
  revalidatePath("/platform/planes");
}

export async function updatePlan(id: string, formData: FormData) {
  await requireSuperAdmin();
  const parsed = planSchema.parse({
    name: formData.get("name"),
    priceMonthly: formData.get("priceMonthly"),
    maxProducts: formData.get("maxProducts") || undefined,
    maxOrdersPerMonth: formData.get("maxOrdersPerMonth") || undefined,
    allowCustomDomain: formData.get("allowCustomDomain") === "true",
    description: formData.get("description") || undefined,
  });

  await prisma.plan.update({
    where: { id },
    data: {
      name: parsed.name,
      priceMonthly: parsed.priceMonthly,
      maxProducts: parsed.maxProducts ?? null,
      maxOrdersPerMonth: parsed.maxOrdersPerMonth ?? null,
      allowCustomDomain: parsed.allowCustomDomain,
      description: parsed.description?.trim() || null,
    },
  });
  revalidatePath("/platform/planes");
  revalidatePath("/platform/tiendas");
}

export async function togglePlanActive(id: string, active: boolean) {
  await requireSuperAdmin();
  await prisma.plan.update({ where: { id }, data: { active } });
  revalidatePath("/platform/planes");
}

export async function deletePlan(id: string) {
  await requireSuperAdmin();
  const tenantCount = await prisma.tenant.count({ where: { planId: id } });
  if (tenantCount > 0) {
    throw new Error("No se puede borrar un plan con tiendas asignadas. Cambiales el plan primero.");
  }
  await prisma.plan.delete({ where: { id } });
  revalidatePath("/platform/planes");
}
