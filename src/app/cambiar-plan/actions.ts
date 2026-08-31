"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? "localhost:3010";
const TOKEN_PREFIX = "plan-change:";

// Se consume acá (no al cargar la página) — así un refresh mientras mira
// los planes no invalida el link, solo se gasta cuando de verdad pide uno.
export async function requestPlan(token: string, planId: string) {
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.expires < new Date() || !record.identifier.startsWith(TOKEN_PREFIX)) {
    throw new Error("Este link venció. Volvé a tu panel y tocá 'Quiero cambiar de plan' de nuevo.");
  }
  await prisma.verificationToken
    .delete({ where: { identifier_token: { identifier: record.identifier, token } } })
    .catch(() => {});

  const tenantId = record.identifier.slice(TOKEN_PREFIX.length);
  const tenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: { requestedPlanId: planId, requestedPlanAt: new Date() },
  });

  const protocol = ROOT_DOMAIN.startsWith("localhost") ? "http" : "https";
  // La sesión del admin en su subdominio nunca se tocó en todo este viaje
  // (dominio distinto, cookie host-only) — sigue viva, no hace falta
  // re-loguearlo para volver.
  redirect(`${protocol}://${tenant.subdomain}.${ROOT_DOMAIN}/admin/configuracion?tab=plan`);
}
