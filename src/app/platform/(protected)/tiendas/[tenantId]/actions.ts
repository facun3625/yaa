"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/require-super-admin";
import { generateCommissionsForPayment } from "@/lib/reseller-commission";

function revalidateTenant(tenantId: string) {
  revalidatePath(`/platform/tiendas/${tenantId}`);
  revalidatePath("/platform/tiendas");
  revalidatePath("/platform");
}

export async function setTenantStatus(tenantId: string, status: "ACTIVE" | "SUSPENDED") {
  await requireSuperAdmin();
  await prisma.tenant.update({ where: { id: tenantId }, data: { status } });
  revalidateTenant(tenantId);
}

export async function setTenantPlan(tenantId: string, planId: string | null) {
  await requireSuperAdmin();
  await prisma.tenant.update({ where: { id: tenantId }, data: { planId } });
  revalidateTenant(tenantId);
}

// El dueño de la tienda pide un plan desde /admin/configuracion (ver
// requestedPlanId en el schema) — esto lo confirma: aplica el plan pedido
// y limpia el pedido, en un solo paso.
export async function applyPlanChangeRequest(tenantId: string, planId: string) {
  await requireSuperAdmin();
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { planId, requestedPlanId: null, requestedPlanAt: null },
  });
  revalidateTenant(tenantId);
}

export async function dismissPlanChangeRequest(tenantId: string) {
  await requireSuperAdmin();
  await prisma.tenant.update({ where: { id: tenantId }, data: { requestedPlanId: null, requestedPlanAt: null } });
  revalidateTenant(tenantId);
}

const BILLING_STATUSES = ["TRIAL", "ACTIVE", "PAST_DUE", "SUSPENDED"] as const;

export async function setBillingStatus(tenantId: string, status: (typeof BILLING_STATUSES)[number]) {
  await requireSuperAdmin();
  await prisma.tenant.update({ where: { id: tenantId }, data: { billingStatus: status } });
  revalidateTenant(tenantId);
}

const paymentSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  note: z.string().optional(),
});

// Registrar un pago a mano: deja constancia en el historial, mueve el
// próximo vencimiento al fin del período pagado, y si la tienda estaba
// vencida o en trial la vuelve a poner "al día" — todo en un solo paso.
export async function registerPayment(tenantId: string, formData: FormData) {
  await requireSuperAdmin();
  const parsed = paymentSchema.parse({
    amount: formData.get("amount"),
    periodStart: formData.get("periodStart"),
    periodEnd: formData.get("periodEnd"),
    note: formData.get("note") || undefined,
  });

  if (parsed.periodEnd <= parsed.periodStart) {
    throw new Error("El fin del período debe ser posterior al inicio");
  }

  const [payment] = await prisma.$transaction([
    prisma.billingPayment.create({
      data: {
        tenantId,
        amount: parsed.amount,
        periodStart: parsed.periodStart,
        periodEnd: parsed.periodEnd,
        note: parsed.note?.trim() || null,
      },
    }),
    prisma.tenant.update({
      where: { id: tenantId },
      data: { nextBillingDate: parsed.periodEnd, billingStatus: "ACTIVE" },
    }),
  ]);

  // Fuera de la transacción a propósito: lee el billingStatus recién
  // actualizado arriba para calcular el escalón del revendedor, así que
  // necesita que ese update ya haya confirmado.
  await generateCommissionsForPayment(tenantId, payment.id, parsed.amount);

  revalidateTenant(tenantId);
}

export async function setTrialEndsAt(tenantId: string, value: string) {
  await requireSuperAdmin();
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { trialEndsAt: value ? new Date(value) : null },
  });
  revalidateTenant(tenantId);
}

export async function setBillingNotes(tenantId: string, notes: string) {
  await requireSuperAdmin();
  await prisma.tenant.update({ where: { id: tenantId }, data: { billingNotes: notes.trim() || null } });
  revalidateTenant(tenantId);
}
