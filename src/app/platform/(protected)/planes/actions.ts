"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/require-super-admin";

const planSchema = z.object({
  name: z.string().min(1, "Ingresá un nombre"),
  priceMonthly: z.coerce.number().nonnegative("El precio no puede ser negativo"),
  priceAnnual: z.coerce.number().nonnegative("El precio anual no puede ser negativo").optional(),
  trialDays: z.coerce.number().int().min(0).max(365),
  maxProducts: z.coerce.number().int().positive().optional(),
  maxOrdersPerMonth: z.coerce.number().int().positive().optional(),
  allowCustomDomain: z.boolean(),
  allowServices: z.boolean(),
  allowLoyalty: z.boolean(),
  allowStats: z.boolean(),
  allowTelegram: z.boolean(),
  description: z.string().optional(),
});

function parsePlanForm(formData: FormData) {
  return planSchema.parse({
    name: formData.get("name"),
    priceMonthly: formData.get("priceMonthly"),
    priceAnnual: formData.get("priceAnnual") || undefined,
    trialDays: formData.get("trialDays"),
    maxProducts: formData.get("maxProducts") || undefined,
    maxOrdersPerMonth: formData.get("maxOrdersPerMonth") || undefined,
    allowCustomDomain: formData.get("allowCustomDomain") === "true",
    allowServices: formData.get("allowServices") === "true",
    allowLoyalty: formData.get("allowLoyalty") === "true",
    allowStats: formData.get("allowStats") === "true",
    allowTelegram: formData.get("allowTelegram") === "true",
    description: formData.get("description") || undefined,
  });
}

export async function createPlan(formData: FormData) {
  await requireSuperAdmin();
  const parsed = parsePlanForm(formData);

  const last = await prisma.plan.findFirst({ orderBy: { order: "desc" } });

  await prisma.plan.create({
    data: {
      name: parsed.name,
      priceMonthly: parsed.priceMonthly,
      priceAnnual: parsed.priceAnnual ?? null,
      trialDays: parsed.trialDays,
      maxProducts: parsed.maxProducts ?? null,
      maxOrdersPerMonth: parsed.maxOrdersPerMonth ?? null,
      allowCustomDomain: parsed.allowCustomDomain,
      allowServices: parsed.allowServices,
      allowLoyalty: parsed.allowLoyalty,
      allowStats: parsed.allowStats,
      allowTelegram: parsed.allowTelegram,
      description: parsed.description?.trim() || null,
      order: (last?.order ?? -1) + 1,
    },
  });
  revalidatePath("/platform/planes");
  revalidatePath("/");
}

export async function updatePlan(id: string, formData: FormData) {
  await requireSuperAdmin();
  const parsed = parsePlanForm(formData);

  await prisma.plan.update({
    where: { id },
    data: {
      name: parsed.name,
      priceMonthly: parsed.priceMonthly,
      priceAnnual: parsed.priceAnnual ?? null,
      trialDays: parsed.trialDays,
      maxProducts: parsed.maxProducts ?? null,
      maxOrdersPerMonth: parsed.maxOrdersPerMonth ?? null,
      allowCustomDomain: parsed.allowCustomDomain,
      allowServices: parsed.allowServices,
      allowLoyalty: parsed.allowLoyalty,
      allowStats: parsed.allowStats,
      allowTelegram: parsed.allowTelegram,
      description: parsed.description?.trim() || null,
    },
  });
  revalidatePath("/platform/planes");
  revalidatePath("/platform/tiendas");
  revalidatePath("/");
}

export async function togglePlanActive(id: string, active: boolean) {
  await requireSuperAdmin();
  await prisma.plan.update({ where: { id }, data: { active } });
  revalidatePath("/platform/planes");
  revalidatePath("/");
}

export async function deletePlan(id: string) {
  await requireSuperAdmin();
  const tenantCount = await prisma.tenant.count({ where: { planId: id } });
  if (tenantCount > 0) {
    throw new Error("No se puede borrar un plan con tiendas asignadas. Cambiales el plan primero.");
  }
  await prisma.plan.delete({ where: { id } });
  revalidatePath("/platform/planes");
  revalidatePath("/");
}

// Solo un plan lleva el badge "Más elegido" en la landing — marcar uno
// desmarca a los demás en el mismo paso.
export async function setFeaturedPlan(id: string) {
  await requireSuperAdmin();
  await prisma.$transaction([
    prisma.plan.updateMany({ where: { featured: true }, data: { featured: false } }),
    prisma.plan.update({ where: { id }, data: { featured: true } }),
  ]);
  revalidatePath("/platform/planes");
  revalidatePath("/");
}

export async function unfeaturePlan(id: string) {
  await requireSuperAdmin();
  await prisma.plan.update({ where: { id }, data: { featured: false } });
  revalidatePath("/platform/planes");
  revalidatePath("/");
}

// Reordena intercambiando el `order` con el plan vecino — así el orden
// siempre queda como una secuencia consistente, sin huecos que arrastrar.
export async function movePlan(id: string, direction: "up" | "down") {
  await requireSuperAdmin();
  const plans = await prisma.plan.findMany({ orderBy: { order: "asc" }, select: { id: true, order: true } });
  const index = plans.findIndex((p) => p.id === id);
  if (index === -1) return;
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= plans.length) return;

  const current = plans[index];
  const neighbor = plans[swapIndex];
  await prisma.$transaction([
    prisma.plan.update({ where: { id: current.id }, data: { order: neighbor.order } }),
    prisma.plan.update({ where: { id: neighbor.id }, data: { order: current.order } }),
  ]);
  revalidatePath("/platform/planes");
  revalidatePath("/");
}
