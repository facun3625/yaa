"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/require-super-admin";

function revalidateRevendedores() {
  revalidatePath("/platform/revendedores");
  revalidatePath("/socios");
  revalidatePath("/revendedores");
}

const settingsSchema = z.object({
  activationBonusAmount: z.coerce.number().nonnegative("No puede ser negativo"),
  activationBonusDays: z.coerce.number().int().positive("Tiene que ser mayor a 0"),
});

export async function updateResellerSettings(formData: FormData) {
  await requireSuperAdmin();
  const parsed = settingsSchema.parse({
    activationBonusAmount: formData.get("activationBonusAmount"),
    activationBonusDays: formData.get("activationBonusDays"),
  });

  await prisma.resellerSettings.upsert({
    where: { id: "global" },
    update: parsed,
    create: { id: "global", ...parsed },
  });
  revalidateRevendedores();
}

const tierSchema = z.object({
  minActiveStores: z.coerce.number().int().nonnegative("No puede ser negativo"),
  percent: z.coerce.number().positive("Tiene que ser mayor a 0").max(100, "No puede superar 100"),
});

export async function createTier(formData: FormData) {
  await requireSuperAdmin();
  const parsed = tierSchema.parse({
    minActiveStores: formData.get("minActiveStores"),
    percent: formData.get("percent"),
  });

  const existing = await prisma.resellerCommissionTier.findUnique({
    where: { minActiveStores: parsed.minActiveStores },
  });
  if (existing) throw new Error("Ya existe un escalón con esa cantidad de tiendas");

  await prisma.resellerCommissionTier.create({ data: parsed });
  revalidateRevendedores();
}

export async function updateTier(id: string, formData: FormData) {
  await requireSuperAdmin();
  const parsed = tierSchema.parse({
    minActiveStores: formData.get("minActiveStores"),
    percent: formData.get("percent"),
  });

  await prisma.resellerCommissionTier.update({ where: { id }, data: parsed });
  revalidateRevendedores();
}

export async function deleteTier(id: string) {
  await requireSuperAdmin();
  await prisma.resellerCommissionTier.delete({ where: { id } });
  revalidateRevendedores();
}

export async function markCommissionPaid(id: string) {
  await requireSuperAdmin();
  await prisma.resellerCommission.update({
    where: { id },
    data: { status: "PAID", paidAt: new Date() },
  });
  revalidateRevendedores();
}

// El revendedor sigue existiendo (no se borra su historial), pero deja de
// poder repartir su código con efecto — cualquiera que lo use de ahora en
// más simplemente no queda asociado a nadie.
export async function deactivateReseller(userId: string) {
  await requireSuperAdmin();
  await prisma.user.update({ where: { id: userId }, data: { referralCode: null } });
  revalidateRevendedores();
}
