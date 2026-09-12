import { notFound } from "next/navigation";
import { requireTenantAdminWithPlan } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationForm } from "./notification-form";
import { SubscribersTable } from "./subscribers-table";

const VALID_TABS = new Set(["enviar", "suscriptos"]);

export default async function AdminNotificacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tenant, features } = await requireTenantAdminWithPlan();
  if (!features.allowPushNotifications) notFound();
  const { tab } = await searchParams;
  const initialTab = tab && VALID_TABS.has(tab) ? tab : "enviar";

  const subscribers = await prisma.pushSubscription.findMany({
    where: { tenantId: tenant.id, user: { role: "CUSTOMER" } },
    select: { id: true, createdAt: true, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Notificaciones</h1>
      <p className="text-sm text-muted-foreground">
        Mandá un mensaje push a los clientes que instalaron la app y activaron notificaciones. Se
        envía apenas hacés clic — no hay borradores ni envío automático.
      </p>

      <Tabs defaultValue={initialTab}>
        <TabsList className="w-full">
          <TabsTrigger value="enviar" className="flex-1">
            Enviar
          </TabsTrigger>
          <TabsTrigger value="suscriptos" className="flex-1">
            Suscriptos ({subscribers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enviar">
          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <NotificationForm subscriberCount={subscribers.length} />
          </div>
        </TabsContent>

        <TabsContent value="suscriptos">
          <SubscribersTable subscribers={subscribers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
