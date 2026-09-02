import { CheckIcon } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireOnboardingUser } from "@/lib/require-onboarding";
import { formatPrice } from "@/lib/format";
import { planFeatureLines } from "@/lib/plan-features";
import { OnboardingSteps } from "../onboarding-steps";
import { OnboardingCredit } from "../onboarding-brand";
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
            {plans.map((plan) => {
              const features = planFeatureLines(plan.description, [
                plan.maxProducts ? `Hasta ${plan.maxProducts} productos` : "Productos sin límite",
                plan.maxOrdersPerMonth ? `Hasta ${plan.maxOrdersPerMonth} pedidos/mes` : "Pedidos sin límite",
                ...(plan.allowCustomDomain ? ["Dominio propio"] : []),
              ]);
              return (
                <form key={plan.id} action={choosePlan.bind(null, plan.id, "MONTHLY")} className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <div className="mt-5 flex items-end gap-1">
                    <span className="text-3xl font-black tracking-tight">{formatPrice(Number(plan.priceMonthly))}</span>
                    <span className="pb-1 text-xs text-white/45">/mes</span>
                  </div>
                  {plan.priceAnnual !== null && (
                    <p className="mt-1 text-sm font-bold text-[#ff7658]">
                      o {formatPrice(Number(plan.priceAnnual))} por año
                    </p>
                  )}
                  <ul className="mt-6 flex flex-col gap-2 border-t border-white/5 pt-5 text-xs text-white/70">
                    <li className="flex items-start gap-2">
                      <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-[#ff7658]" />
                      {plan.trialDays > 0 ? `${plan.trialDays} días de prueba incluidos` : "Sin período de prueba"}
                    </li>
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-[#ff7658]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 grid gap-2">
                    <button formAction={choosePlan.bind(null, plan.id, "MONTHLY")} className="yaa-btn yaa-btn-primary w-full justify-center">
                      Elegir mensual
                    </button>
                    {plan.priceAnnual !== null && (
                      <button formAction={choosePlan.bind(null, plan.id, "ANNUAL")} className="yaa-btn yaa-btn-secondary w-full justify-center">
                        Elegir anual
                      </button>
                    )}
                  </div>
                </form>
              );
            })}
          </div>
        )}
        <OnboardingCredit />
      </div>
    </main>
  );
}
