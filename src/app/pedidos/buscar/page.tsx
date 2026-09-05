import { notFound } from "next/navigation";

import { getCurrentTenant } from "@/lib/tenant";
import { StoreHero } from "@/components/catalog/store-hero";
import { StoreFooter } from "@/components/catalog/store-footer";
import { SearchForm } from "./search-form";

// Página pública, sin login — para quien compró como invitado y perdió el
// link de confirmación de su pedido (o el mail nunca le llegó).
export default async function BuscarPedidoPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <StoreHero />
      <div className="relative z-1 -mt-6 mx-5 flex flex-1 flex-col rounded-t-3xl bg-background lg:-mt-32 lg:mx-auto lg:w-full lg:max-w-[1440px] lg:shadow-2xl">
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold">Buscar mi pedido</h1>
            <p className="text-sm text-muted-foreground">
              Si pediste sin crear una cuenta, buscalo acá con el teléfono y el email que usaste al pedir.
            </p>
          </div>
          <SearchForm />
        </main>
      </div>
      <StoreFooter />
    </div>
  );
}
