"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireOnboardingUser } from "@/lib/require-onboarding";

export async function choosePlan(planId: string, billingCycle: "MONTHLY" | "ANNUAL") {
  const session = await requireOnboardingUser();

  const plan = await prisma.plan.findUnique({ where: { id: planId, active: true } });
  if (!plan) throw new Error("Ese plan ya no está disponible");
  if (billingCycle === "ANNUAL" && plan.priceAnnual === null) {
    throw new Error("Ese plan no ofrece facturación anual");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      pendingPlanId: plan.id,
      pendingBillingCycle: billingCycle,
      pendingSubscriptionId: null,
      pendingSubscriptionStatus: null,
      onboardingPaidAt: null,
    },
  });

  redirect("/registro/datos");
}
