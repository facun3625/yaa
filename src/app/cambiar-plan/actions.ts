"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? "localhost:3010";
const TOKEN_PREFIX = "plan-change:";

// No hay pasarela de pago real todavía — mismo caso que
// registro/pago/actions.ts, confirmMockPayment. El día que se integre
// Mercado Pago u otra, este es el lugar a reemplazar: en vez de aplicar el
// plan directo, se dispara el checkout real y esto se dispara recién
// cuando confirme el webhook.
//
// Se consume acá (no al cargar la página) — así un refresh mientras mira
// los planes no invalida el link, solo se gasta cuando de verdad confirma.
export async function confirmPlanChange(token: string, planId: string) {
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
    data: { planId, requestedPlanId: null, requestedPlanAt: null },
  });

  const protocol = ROOT_DOMAIN.startsWith("localhost") ? "http" : "https";
  // La sesión del admin en su subdominio nunca se tocó en todo este viaje
  // (dominio distinto, cookie host-only) — sigue viva, no hace falta
  // re-loguearlo para volver.
  redirect(`${protocol}://${tenant.subdomain}.${ROOT_DOMAIN}/admin/configuracion?tab=plan`);
}
