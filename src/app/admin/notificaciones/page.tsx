import { requireTenantAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { NotificationForm } from "./notification-form";

export default async function AdminNotificacionesPage() {
  const { tenant } = await requireTenantAdmin();

  const subscriberCount = await prisma.pushSubscription.count({
    where: { tenantId: tenant.id, user: { role: "CUSTOMER" } },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Notificaciones</h1>
      <p className="text-sm text-muted-foreground">
        Mandá un mensaje push a los clientes que instalaron la app y activaron notificaciones. Se
        envía apenas hacés clic — no hay borradores ni envío automático.
      </p>

      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <NotificationForm subscriberCount={subscriberCount} />
      </div>
    </div>
  );
}
