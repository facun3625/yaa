import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentTenant } from "@/lib/tenant";

export async function requireTenantAdmin() {
  const tenant = await getCurrentTenant();
  if (!tenant) throw new Error("Tienda no encontrada");

  const session = await auth();
  if (session?.user.role !== "ADMIN" || session.user.tenantId !== tenant.id) {
    throw new Error("No autorizado");
  }
  return { session, tenant };
}

export type PlanFeatures = {
  allowServices: boolean;
  allowLoyalty: boolean;
  allowStats: boolean;
  allowTelegram: boolean;
  allowCustomDomain: boolean;
};

export async function requireTenantAdminWithPlan() {
  const { session, tenant } = await requireTenantAdmin();
  const plan = await prisma.plan.findUnique({
    where: { id: tenant.planId ?? "" },
    select: { allowServices: true, allowLoyalty: true, allowStats: true, allowTelegram: true, allowCustomDomain: true },
  });
  const features: PlanFeatures = {
    allowServices: plan?.allowServices ?? false,
    allowLoyalty: plan?.allowLoyalty ?? false,
    allowStats: plan?.allowStats ?? false,
    allowTelegram: plan?.allowTelegram ?? false,
    allowCustomDomain: plan?.allowCustomDomain ?? false,
  };
  return { session, tenant, features };
}

// Para código que corre en el dominio raíz (yaa.com.ar), no en el
// subdominio de la tienda — ahí `getCurrentTenant()` no sirve porque
// depende del header de subdominio que pone proxy.ts. Se resuelve por
// session.user.tenantId (viaja en el JWT) en su lugar.
export async function requireOwnTenantAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN" || !session.user.tenantId) {
    throw new Error("No autorizado");
  }
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: session.user.tenantId } });
  return { session, tenant };
}
