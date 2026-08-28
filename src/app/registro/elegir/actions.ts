"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireOnboardingUser } from "@/lib/require-onboarding";
import { generateReferralCode } from "@/lib/referral-code";

// Le genera el código de referido — no hace falta que nadie lo apruebe, ver
// plan del programa de revendedores. A propósito NO toca `role`: seguir
// siendo CUSTOMER acá es lo que le deja, más adelante, también crear su
// propia tienda sin que "ser socio" se lo impida (ver requireReseller,
// que gatea por tener código, no por rol).
export async function becomeReseller() {
  const session = await requireOnboardingUser();

  const referralCode = await generateReferralCode();
  await prisma.user.update({
    where: { id: session.user.id },
    data: { referralCode },
  });

  redirect("/socios");
}
