"use server";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { generateReferralCode } from "@/lib/referral-code";
import { prisma } from "@/lib/prisma";

export async function joinResellerProgram() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, referralCode: true, resellerDeactivatedAt: true },
  });
  if (!user || user.role === "SUPER_ADMIN") throw new Error("Esta cuenta no puede incorporarse como socio");
  if (user.resellerDeactivatedAt) {
    throw new Error("Tu perfil de socio está pausado. Contactanos para solicitar su reactivación");
  }
  if (user.referralCode) redirect("/socios");

  const referralCode = await generateReferralCode();
  await prisma.user.update({
    where: { id: session.user.id },
    data: { referralCode },
  });

  redirect("/socios");
}
