"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/require-super-admin";
import { generateCommissionsForPayment } from "@/lib/reseller-commission";
import { getPlatformMercadoPagoCredentials } from "@/lib/platform-billing";
import { updateSubscriptionBilling } from "@/lib/mercadopago";

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
  await applyTenantPlan(tenantId, planId, false);
  revalidateTenant(tenantId);
}

async function applyTenantPlan(tenantId: string, planId: string | null, clearRequest: boolean) {
  const [tenant, plan] = await Promise.all([
    prisma.tenant.findUniqueOrThrow({
      where: { id: tenantId },
      select: { providerSubscriptionId: true, providerSubscriptionStatus: true, billingCycle: true },
    }),
    planId ? prisma.plan.findUnique({ where: { id: planId, active: true } }) : null,
  ]);
  if (planId && !plan) throw new Error("Ese plan ya no está disponible");
  if (!planId && tenant.providerSubscriptionId) {
    throw new Error("No se puede quitar el plan mientras exista una suscripción de Mercado Pago");
  }

  if (plan && tenant.providerSubscriptionId && ["authorized", "pending"].includes(tenant.providerSubscriptionStatus ?? "")) {
    const amount = tenant.billingCycle === "ANNUAL" ? Number(plan.priceAnnual) : Number(plan.priceMonthly);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(tenant.billingCycle === "ANNUAL" ? "El nuevo plan no ofrece pago anual" : "El nuevo plan no tiene un precio válido");
    }
    const credentials = await getPlatformMercadoPagoCredentials();
    if (!credentials.accessToken) throw new Error("Falta configurar Mercado Pago para actualizar la suscripción");
    const updated = await updateSubscriptionBilling(credentials.accessToken, tenant.providerSubscriptionId, {
      reason: `YAA · ${plan.name} · ${tenant.billingCycle === "ANNUAL" ? "Anual" : "Mensual"}`,
      amount,
    });
    if (Math.abs(updated.amount - amount) > 0.01) {
      throw new Error("Mercado Pago no confirmó el nuevo importe; el plan no fue modificado");
    }
  }

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      planId,
      ...(clearRequest ? { requestedPlanId: null, requestedPlanAt: null } : {}),
      subscriptionSyncedAt: tenant.providerSubscriptionId ? new Date() : undefined,
    },
  });
}

// El dueño de la tienda pide un plan desde /admin/configuracion (ver
// requestedPlanId en el schema) — esto lo confirma: aplica el plan pedido
// y limpia el pedido, en un solo paso.
export async function applyPlanChangeRequest(tenantId: string, planId: string) {
  await requireSuperAdmin();
  await applyTenantPlan(tenantId, planId, true);
  revalidateTenant(tenantId);
}

export async function dismissPlanChangeRequest(tenantId: string) {
  await requireSuperAdmin();
  await prisma.tenant.update({ where: { id: tenantId }, data: { requestedPlanId: null, requestedPlanAt: null } });
  revalidateTenant(tenantId);
}

type BillingStatusValue = "TRIAL" | "ACTIVE" | "PAST_DUE" | "SUSPENDED";

export async function setBillingStatus(tenantId: string, status: BillingStatusValue) {
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

  // Si había un pedido de cambio de plan pendiente, registrar el cobro es
  // justo el momento en que confirmás que la plata entró — se aplica acá
  // mismo, en el mismo click, en vez de hacerte volver a esta pantalla a
  // tocar "Aplicar" aparte.
  const pending = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { requestedPlanId: true, providerSubscriptionId: true },
  });

  // Si existe débito automático, el cambio debe pasar por "Aplicar cambio"
  // para actualizar primero el importe en Mercado Pago. Un pago manual no
  // puede cambiar a escondidas el producto que la pasarela sigue cobrando.
  const applyPendingPlan = pending?.requestedPlanId && !pending.providerSubscriptionId;

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
      data: {
        nextBillingDate: parsed.periodEnd,
        billingStatus: "ACTIVE",
        ...(applyPendingPlan
          ? { planId: pending.requestedPlanId, requestedPlanId: null, requestedPlanAt: null }
          : {}),
      },
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

// Borra la tienda y absolutamente todo lo que le pertenece — catálogo,
// pedidos, cupones, historial de pagos, comisiones generadas por sus cobros.
// Irreversible. El orden importa: hay que vaciar las tablas que referencian
// a la tienda (o a sus pedidos/productos) antes de poder borrar las que
// referencian, y por último la tienda misma.
export async function deleteTenant(tenantId: string) {
  await requireSuperAdmin();

  await prisma.$transaction(async (tx) => {
    await tx.pointsLedger.deleteMany({ where: { user: { tenantId } } });
    await tx.couponRedemption.deleteMany({ where: { coupon: { tenantId } } });
    await tx.order.deleteMany({ where: { tenantId } });
    await tx.coupon.deleteMany({ where: { tenantId } });
    await tx.pointsRule.deleteMany({ where: { tenantId } });
    await tx.stockMovement.deleteMany({ where: { tenantId } });
    await tx.pickupSlot.deleteMany({ where: { tenantId } });
    await tx.fulfillmentMethodConfig.deleteMany({ where: { tenantId } });
    await tx.paymentMethodConfig.deleteMany({ where: { tenantId } });
    await tx.weeklyScheduleRule.deleteMany({ where: { tenantId } });
    await tx.storeClosure.deleteMany({ where: { tenantId } });
    await tx.deliveryDate.deleteMany({ where: { tenantId } });
    await tx.serviceInquiry.deleteMany({ where: { tenantId } });
    await tx.service.deleteMany({ where: { tenantId } });
    await tx.product.deleteMany({ where: { tenantId } });
    await tx.productCategory.deleteMany({ where: { tenantId } });
    await tx.stockGroup.deleteMany({ where: { tenantId } });
    await tx.emailLog.deleteMany({ where: { tenantId } });
    await tx.whatsappLog.deleteMany({ where: { tenantId } });
    await tx.aboutMedia.deleteMany({ where: { tenantId } });
    await tx.settings.deleteMany({ where: { tenantId } });
    await tx.resellerCommission.deleteMany({ where: { tenantId } });
    await tx.billingPayment.deleteMany({ where: { tenantId } });
    await tx.promotionRedemption.deleteMany({ where: { tenantId } });

    // Un usuario de esta tienda que además es revendedor (tiene código
    // propio) no se borra — pierde la tienda pero conserva su cuenta y su
    // historial de comisiones de otras tiendas, igual que alguien que nunca
    // llegó a tener tienda propia.
    await tx.user.updateMany({
      where: { tenantId, referralCode: { not: null } },
      data: { tenantId: null, role: "CUSTOMER" },
    });
    await tx.user.deleteMany({ where: { tenantId } });

    await tx.tenant.delete({ where: { id: tenantId } });
  });

  revalidatePath("/platform/tiendas");
}
