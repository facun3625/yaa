import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/require-super-admin";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteUserButton } from "./delete-user-button";

const dateFormatter = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" });

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireSuperAdmin();
  const params = await searchParams;
  const q = params.q?.trim();

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { tenant: { subdomain: { contains: q, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: { tenant: { select: { id: true, subdomain: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Usuarios</h1>
        <p className="text-sm text-muted-foreground">
          {users.length} {users.length === 1 ? "cuenta" : "cuentas"} — qué servicios tiene cada una y desde cuándo.
        </p>
      </div>

      <form className="max-w-sm">
        <Input name="q" defaultValue={q ?? ""} placeholder="Buscar por nombre, email o tienda..." />
      </form>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Servicios</TableHead>
              <TableHead>Alta</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const hasStore = u.role === "ADMIN" && Boolean(u.tenant);
              const isReseller = Boolean(u.referralCode);
              const isSuperAdmin = u.role === "SUPER_ADMIN";
              const isPlainCustomer = !hasStore && !isReseller && !isSuperAdmin;

              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{u.name ?? "Sin nombre"}</span>
                      <span className="text-xs font-normal text-muted-foreground">{u.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {isSuperAdmin && <Badge variant="outline">Super admin</Badge>}
                      {hasStore && u.tenant && (
                        <Link href={`/platform/tiendas/${u.tenant.id}`}>
                          <Badge>Tienda: {u.tenant.subdomain}</Badge>
                        </Link>
                      )}
                      {isReseller && (
                        <Badge variant="secondary">
                          Revendedor{u.resellerDeactivatedAt ? " (desactivado)" : ""}
                        </Badge>
                      )}
                      {isPlainCustomer && <Badge variant="outline">Cliente</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{dateFormatter.format(u.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {isSuperAdmin ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <DeleteUserButton
                        userId={u.id}
                        label={u.name ?? u.email}
                        hasStore={hasStore}
                        isReseller={isReseller}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {q ? "No hay usuarios que coincidan con la búsqueda." : "Todavía no hay usuarios."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
