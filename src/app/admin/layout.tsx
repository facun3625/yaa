import { Montserrat } from "next/font/google";
import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar, type AdminNotification } from "@/components/admin/admin-topbar";
import { AdminThemeRoot } from "@/components/admin/admin-theme-root";
import { ConfirmProvider } from "@/components/admin/confirm-provider";
import { PromptProvider } from "@/components/admin/prompt-provider";
import { prisma } from "@/lib/prisma";
import { requireTenantAdminWithPlan } from "@/lib/require-admin";
import { getStockAlerts } from "@/lib/stock-alerts";
import { isDemoSubdomain, DEMO_LAST_ACTIVE_KEY } from "@/lib/demo";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? "localhost:3010";

// Sin esto, una sesión demo olvidada abierta (o un link viejo reusado
// directo, sin pasar por /demo) queda válida hasta que expire el cookie de
// NextAuth (30 días por default) — mucho para una clave pública. No hay
// forma confiable de detectar "se cerró la pestaña" desde una cookie de
// sesión, así que en cambio se corta por inactividad: 30 minutos sin cargar
// ninguna página del panel.
const DEMO_INACTIVITY_LIMIT_MS = 30 * 60 * 1000;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { session, tenant, features } = await requireTenantAdminWithPlan();
  const trialDaysLeft = tenant.billingStatus === "TRIAL" && tenant.trialEndsAt
    ? Math.max(0, Math.ceil((tenant.trialEndsAt.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)))
    : null;

  const [stockAlerts, newInquiryCount, pendingOrderCount, recentInquiries, recentOrders, currentPlan, topPlan, salesModeConfigured] = await Promise.all([
    getStockAlerts(tenant.id),
    prisma.serviceInquiry.count({ where: { tenantId: tenant.id, status: "NEW" } }),
    prisma.order.count({ where: { tenantId: tenant.id, status: { in: ["PENDING_PAYMENT", "PAYMENT_REVIEW", "CONFIRMED"] } } }),
    prisma.serviceInquiry.findMany({ where: { tenantId: tenant.id, status: "NEW" }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, serviceTitle: true, createdAt: true } }),
    prisma.order.findMany({ where: { tenantId: tenant.id, status: { in: ["PENDING_PAYMENT", "PAYMENT_REVIEW", "CONFIRMED"] } }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, guestName: true, user: { select: { name: true, email: true } }, createdAt: true } }),
    tenant.planId ? prisma.plan.findUnique({ where: { id: tenant.planId }, select: { name: true, order: true } }) : null,
    prisma.plan.findFirst({ where: { active: true }, orderBy: { order: "desc" }, select: { order: true } }),
    // Sin al menos un horario semanal habilitado o una venta programada, la
    // tienda queda "cerrada" y ningún producto se muestra por más que esté
    // cargado — se avisa en el topbar, visible en todo el panel, antes de
    // que lo confunda con un bug.
    tenant.orderingMode === "WEEKLY_HOURS"
      ? prisma.weeklyScheduleRule
          .findFirst({ where: { tenantId: tenant.id, enabled: true, windows: { some: {} } } })
          .then(Boolean)
      : prisma.deliveryDate.findFirst({ where: { tenantId: tenant.id } }).then(Boolean),
  ]);

  // Mientras alguien navega el panel de una copia demo, cada carga de
  // página refresca su marca de "última actividad" — así /demo no manda una
  // segunda visita ahí mismo, y si esa marca quedó vieja (nadie tocó nada
  // en 30 minutos) se corta la sesión antes de mostrar el panel.
  if (isDemoSubdomain(tenant.subdomain)) {
    const lastActive = await prisma.settings.findUnique({
      where: { tenantId_key: { tenantId: tenant.id, key: DEMO_LAST_ACTIVE_KEY } },
    });
    const idleMs = lastActive ? new Date().getTime() - new Date(lastActive.value).getTime() : 0;
    if (idleMs > DEMO_INACTIVITY_LIMIT_MS) {
      const protocol = ROOT_DOMAIN.startsWith("localhost") ? "http" : "https";
      const returnTo = `${protocol}://${tenant.subdomain}.${ROOT_DOMAIN}/login`;
      redirect(`/api/auth/logout-all?returnTo=${encodeURIComponent(returnTo)}`);
    }
    await prisma.settings.upsert({
      where: { tenantId_key: { tenantId: tenant.id, key: DEMO_LAST_ACTIVE_KEY } },
      update: { value: new Date().toISOString() },
      create: { tenantId: tenant.id, key: DEMO_LAST_ACTIVE_KEY, value: new Date().toISOString() },
    });
  }

  const planInfo = currentPlan ? { name: currentPlan.name, canUpgrade: Boolean(topPlan && currentPlan.order < topPlan.order) } : null;
  const notifications: AdminNotification[] = [
    ...recentInquiries.map((item) => ({ id: item.id, type: "INQUIRY" as const, title: "Nueva consulta", detail: item.serviceTitle, href: `/admin/consultas/${item.id}`, createdAt: item.createdAt.toISOString() })),
    ...recentOrders.map((item) => ({ id: item.id, type: "ORDER" as const, title: "Nuevo pedido", detail: item.user?.name ?? item.user?.email ?? item.guestName ?? `Pedido #${item.id.slice(-8).toUpperCase()}`, href: `/admin/pedidos/${item.id}`, createdAt: item.createdAt.toISOString() })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);

  return (
    <AdminThemeRoot fontFamily={montserrat.style.fontFamily} variant="store" defaultTheme="dark">
      <ConfirmProvider>
        <PromptProvider>
          <aside className="hidden bg-sidebar h-full overflow-y-auto w-64 shrink-0 border-r border-sidebar-border print:hidden lg:flex lg:flex-col">
            <AdminSidebar newInquiryCount={newInquiryCount} newOrderCount={pendingOrderCount} features={features} planInfo={planInfo} />
          </aside>
          <div className="flex min-w-0 min-h-0 flex-1 flex-col h-full overflow-hidden">
            <AdminTopbar
              storeOpen={tenant.storeOpen}
              stockAlerts={stockAlerts}
              newInquiryCount={newInquiryCount}
              newOrderCount={pendingOrderCount}
              notificationCount={newInquiryCount + pendingOrderCount}
              notifications={notifications}
              billingStatus={tenant.billingStatus}
              trialDaysLeft={trialDaysLeft}
              features={features}
              planInfo={planInfo}
              salesModeConfigured={Boolean(salesModeConfigured)}
              impersonating={Boolean(session.user.impersonatedBy)}
              platformUrl={`${ROOT_DOMAIN.startsWith("localhost") ? "http" : "https"}://${ROOT_DOMAIN}/platform`}
            />
            <main className="flex-1 min-h-0 overflow-y-auto px-4 py-6 lg:px-8 print:p-0">{children}</main>
          </div>
        </PromptProvider>
      </ConfirmProvider>
    </AdminThemeRoot>
  );
}
