import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireTenantAdmin } from "@/lib/require-admin";
import { NewProductForm } from "./new-product-form";

export default async function NewProductPage() {
  const { tenant } = await requireTenantAdmin();
  const [categories, stockGroups] = await Promise.all([
    prisma.productCategory.findMany({ where: { tenantId: tenant.id }, orderBy: { name: "asc" } }),
    prisma.stockGroup.findMany({
      where: { tenantId: tenant.id },
      include: { _count: { select: { variants: true } } },
      orderBy: { name: "asc" },
    }),
  ]);
  // Sin filtrar por cantidad de miembros: un grupo recién creado desde
  // "Grupos de stock" arranca en 0 y nunca podría elegirse la primera vez
  // si acá exigiéramos 2+ — quedaba imposible de usar.
  const sharedStockGroups = stockGroups;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Nuevo producto</h1>

      {categories.length === 0 ? (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          Necesitás cargar al menos un tipo de producto antes de crear uno.{" "}
          <Link href="/admin/productos" className="underline">
            Volver
          </Link>
        </p>
      ) : (
        <NewProductForm
          categories={categories}
          stockGroups={sharedStockGroups.map((g) => ({ id: g.id, name: g.name }))}
        />
      )}
    </div>
  );
}
