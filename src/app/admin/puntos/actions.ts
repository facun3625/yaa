"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireTenantAdmin } from "@/lib/require-admin";

const rateSchema = z.object({
  pointsPerAmount: z.coerce.number().nonnegative("No puede ser negativo"),
});

export async function updatePointsRate(formData: FormData) {
  const { tenant } = await requireTenantAdmin();
  const parsed = rateSchema.parse({ pointsPerAmount: formData.get("pointsPerAmount") });

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.pointsRule.updateMany({
      where: { tenantId: tenant.id, effectiveTo: null },
      data: { effectiveTo: now },
    });
    await tx.pointsRule.create({
      data: { tenantId: tenant.id, pointsPerAmount: parsed.pointsPerAmount, effectiveFrom: now },
    });
  });

  revalidatePath("/admin/puntos");
}
