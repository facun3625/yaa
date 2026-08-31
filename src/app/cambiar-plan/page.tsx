import Image from "next/image";
import { CheckIcon } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { requestPlan } from "./actions";

const TOKEN_PREFIX = "plan-change:";

export default async function CambiarPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  // Sin sesión: quien manda acá es el token de un solo uso que armó
  // /admin/configuracion (ver src/app/admin/configuracion/actions.ts,
  // startPlanChangeRequest) — no hace falta estar logueado en el dominio
  // raíz para esto, la identidad viaja en el token.
  const record = token
    ? await prisma.verificationToken.findUnique({ where: { token } })
    : null;
  const valid = record && record.expires > new Date() && record.identifier.startsWith(TOKEN_PREFIX);

  if (!valid) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#030712] px-4 text-center text-white">
        <Image src="/yaa-logo-clean.svg" alt="yaa" width={835} height={478} className="h-8 w-auto object-contain" />
        <h1 className="mt-4 text-xl font-semibold">Este link venció</h1>
        <p className="max-w-sm text-sm text-white/50">
          Volvé al panel de tu tienda y tocá &quot;Quiero cambiar de plan&quot; de nuevo.
        </p>
      </main>
    );
  }

  const tenantId = record.identifier.slice(TOKEN_PREFIX.length);
  const [tenant, plans] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId }, include: { plan: true } }),
    prisma.plan.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
  ]);

  if (!tenant) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#030712] px-4 text-center text-white">
        <p className="text-sm text-white/50">No encontramos esa tienda.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030712] px-4 py-12 text-white">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image src="/yaa-logo-clean.svg" alt="yaa" width={835} height={478} className="h-8 w-auto object-contain" />
          <h1 className="mt-2 text-2xl font-bold">Cambiar el plan de {tenant.subdomain}</h1>
          <p className="text-sm text-white/50">
            Plan actual: <span className="font-medium text-white">{tenant.plan?.name ?? "sin plan"}</span>. Elegí el
            que querés — le llega a nuestro equipo para confirmarlo, todavía no se aplica solo.
          </p>
        </div>

        {plans.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/15 p-10 text-center text-sm text-white/50">
            Todavía no hay planes disponibles.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = plan.id === tenant.planId;
              return (
                <form
                  key={plan.id}
                  action={requestPlan.bind(null, token!, plan.id)}
                  className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    {isCurrent && (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/60">Actual</span>
                    )}
                  </div>
                  {plan.description && <p className="mt-1 min-h-10 text-xs leading-relaxed text-white/45">{plan.description}</p>}
                  <div className="mt-5 flex items-end gap-1">
                    <span className="text-3xl font-black tracking-tight">{formatPrice(Number(plan.priceMonthly))}</span>
                    <span className="pb-1 text-xs text-white/45">/mes</span>
                  </div>
                  <ul className="mt-6 flex flex-col gap-2 border-t border-white/5 pt-5 text-xs text-white/70">
                    <li className="flex items-start gap-2"><CheckIcon className="mt-0.5 size-3.5 shrink-0 text-[#ff7658]" />{plan.maxProducts ? `Hasta ${plan.maxProducts} productos` : "Productos sin límite"}</li>
                    <li className="flex items-start gap-2"><CheckIcon className="mt-0.5 size-3.5 shrink-0 text-[#ff7658]" />{plan.maxOrdersPerMonth ? `Hasta ${plan.maxOrdersPerMonth} pedidos/mes` : "Pedidos sin límite"}</li>
                    {plan.allowCustomDomain && <li className="flex items-start gap-2"><CheckIcon className="mt-0.5 size-3.5 shrink-0 text-[#ff7658]" />Dominio propio</li>}
                  </ul>
                  <button
                    type="submit"
                    disabled={isCurrent}
                    className="yaa-btn yaa-btn-primary mt-6 w-full justify-center disabled:opacity-40"
                  >
                    {isCurrent ? "Es tu plan actual" : `Pedir ${plan.name}`}
                  </button>
                </form>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
