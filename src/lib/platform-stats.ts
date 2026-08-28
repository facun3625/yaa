import { prisma } from "@/lib/prisma";

const NON_CANCELLED = { not: "CANCELLED" as const };

export type PlatformStats = {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  pastDueTenants: number;
  suspendedTenants: number;
  mrr: number;
  ordersLast30Days: number;
  newTenantsThisMonth: number;
  signupsByMonth: { key: string; label: string; value: number }[];
};

export async function getPlatformStats(): Promise<PlatformStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    totalTenants,
    trialTenants,
    pastDueTenants,
    suspendedBillingTenants,
    activePlans,
    ordersLast30Days,
    newTenantsThisMonth,
    recentTenants,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { billingStatus: "TRIAL" } }),
    prisma.tenant.count({ where: { billingStatus: "PAST_DUE" } }),
    prisma.tenant.count({ where: { billingStatus: "SUSPENDED" } }),
    prisma.tenant.findMany({
      where: { billingStatus: "ACTIVE", plan: { isNot: null } },
      select: { plan: { select: { priceMonthly: true } } },
    }),
    prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo }, status: NON_CANCELLED } }),
    prisma.tenant.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.tenant.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
  ]);

  const mrr = activePlans.reduce((sum, t) => sum + Number(t.plan?.priceMonthly ?? 0), 0);
  const activeTenants = totalTenants - trialTenants - pastDueTenants - suspendedBillingTenants;

  const monthFormatter = new Intl.DateTimeFormat("es-AR", { month: "short" });
  const buckets = new Map<string, { label: string; value: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    buckets.set(key, { label: monthFormatter.format(d), value: 0 });
  }
  for (const t of recentTenants) {
    const key = `${t.createdAt.getFullYear()}-${t.createdAt.getMonth()}`;
    const bucket = buckets.get(key);
    if (bucket) bucket.value += 1;
  }

  return {
    totalTenants,
    activeTenants: Math.max(0, activeTenants),
    trialTenants,
    pastDueTenants,
    suspendedTenants: suspendedBillingTenants,
    mrr,
    ordersLast30Days,
    newTenantsThisMonth,
    signupsByMonth: [...buckets.entries()].map(([key, v]) => ({ key, ...v })),
  };
}
