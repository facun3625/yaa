import { CheckIcon } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireOnboardingUser } from "@/lib/require-onboarding";
import { formatPrice } from "@/lib/format";
import { OnboardingSteps } from "../onboarding-steps";
import { choosePlan } from "./actions";

export default async function ChoosePlanPage() {
  await requireOnboardingUser();
  const plans = await prisma.plan.findMany({ where: { active: true }, orderBy: { order: "asc" } });

  return (
    <main className="min-h-screen bg-[#030712] px-4 py-12 text-white">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <OnboardingSteps current={2} />

        <div className="text-center">
          <h1 className="text-2xl font-bold">Elegí tu plan</h1>
          <p className="mt-2 text-sm text-white/50">Podés cambiarlo más adelante desde tu panel.</p>
        </div>

        {plans.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/15 p-10 text-center text-sm text-white/50">
            Todavía no hay planes disponibles — volvé más tarde.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {plans.map((plan) => (
              <form key={plan.id} action={choosePlan.bind(null, plan.id)} className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-lg font-bold">{plan.name}</h3>
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
                <button type="submit" className="yaa-btn yaa-btn-primary mt-6 w-full justify-center">
                  Elegir {plan.name}
                </button>
              </form>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
