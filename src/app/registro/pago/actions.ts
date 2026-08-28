"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireOnboardingUser } from "@/lib/require-onboarding";

// No hay pasarela de pago real todavía (ver conversación con el equipo) —
// esto simula el cobro para poder probar el flujo completo. El día que se
// integre Mercado Pago u otra, este es el único lugar a reemplazar: en vez
// de marcar onboardingPaidAt directo, se dispara el checkout real y recién
// se marca acá cuando confirme el webhook.
export async function confirmMockPayment() {
  const session = await requireOnboardingUser();

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.pendingPlanId) redirect("/registro/plan");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingPaidAt: new Date() },
  });

  redirect("/registro/datos");
}
