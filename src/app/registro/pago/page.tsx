import { redirect } from "next/navigation";
import { ShieldCheckIcon } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireOnboardingUser } from "@/lib/require-onboarding";
import { formatPrice } from "@/lib/format";
import { OnboardingSteps } from "../onboarding-steps";
import { confirmMockPayment } from "./actions";

export default async function PagoPage() {
  const session = await requireOnboardingUser();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { pendingPlan: true },
  });
  if (!user?.pendingPlan) redirect("/registro/plan");

  return (
    <main className="min-h-screen bg-[#030712] px-4 py-12 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <OnboardingSteps current={3} />

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h1 className="text-xl font-bold">Confirmá tu pago</h1>
          <p className="mt-1 text-sm text-white/50">Plan {user.pendingPlan.name}, facturación mensual.</p>

          <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-sm text-white/70">Total hoy</span>
            <span className="text-lg font-bold">{formatPrice(Number(user.pendingPlan.priceMonthly))}</span>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
            <ShieldCheckIcon className="mt-0.5 size-4 shrink-0" />
            Todavía no integramos una pasarela de pago real — este botón simula el cobro para poder probar el resto del alta.
          </div>

          <form action={confirmMockPayment}>
            <button type="submit" className="yaa-btn yaa-btn-primary mt-6 w-full justify-center">
              Confirmar pago (simulado)
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
