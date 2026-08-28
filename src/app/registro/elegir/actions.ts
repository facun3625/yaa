"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireOnboardingUser } from "@/lib/require-onboarding";
import { generateReferralCode } from "@/lib/referral-code";

// Promueve al usuario que se está registrando (CUSTOMER, tenantId null) a
// RESELLER — no hace falta que nadie lo apruebe, ver plan del programa de
// revendedores. Le genera su código de referido de una y lo manda directo
// a su panel.
export async function becomeReseller() {
  const session = await requireOnboardingUser();

  const referralCode = await generateReferralCode();
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      role: "RESELLER",
      referralCode,
      // Ya no aplica si venía de un flujo de alta de tienda a medio hacer.
      pendingPlanId: null,
      onboardingPaidAt: null,
    },
  });

  redirect("/socios");
}
