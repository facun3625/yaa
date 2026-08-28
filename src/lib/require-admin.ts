import { auth } from "@/auth";
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
