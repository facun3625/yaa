"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireOnboardingUser } from "@/lib/require-onboarding";

export async function choosePlan(planId: string) {
  const session = await requireOnboardingUser();

  const plan = await prisma.plan.findUnique({ where: { id: planId, active: true } });
  if (!plan) throw new Error("Ese plan ya no está disponible");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { pendingPlanId: plan.id },
  });

  redirect("/registro/pago");
}
