import Image from "next/image";
import { notFound } from "next/navigation";
import { ShieldCheckIcon } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { confirmPlanChange } from "../actions";

const TOKEN_PREFIX = "plan-change:";

export default async function ConfirmarCambioPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; planId?: string }>;
}) {
  const { token, planId } = await searchParams;

  const record = token ? await prisma.verificationToken.findUnique({ where: { token } }) : null;
  const valid = record && record.expires > new Date() && record.identifier.startsWith(TOKEN_PREFIX);
  if (!valid || !planId) notFound();

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) notFound();

  return (
    <main className="min-h-screen bg-[#030712] px-4 py-12 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <Image src="/yaa-logo-clean.svg" alt="yaa" width={835} height={478} className="mx-auto h-8 w-auto object-contain" />

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h1 className="text-xl font-bold">Confirmá tu pago</h1>
          <p className="mt-1 text-sm text-white/50">Cambio a plan {plan.name}, facturación mensual.</p>

          <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-sm text-white/70">Total hoy</span>
            <span className="text-lg font-bold">{formatPrice(Number(plan.priceMonthly))}</span>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
            <ShieldCheckIcon className="mt-0.5 size-4 shrink-0" />
            Todavía no integramos una pasarela de pago real — este botón simula el cobro para poder probar el resto
            del flujo.
          </div>

          <form action={confirmPlanChange.bind(null, token!, planId)}>
            <button type="submit" className="yaa-btn yaa-btn-primary mt-6 w-full justify-center">
              Confirmar pago (simulado)
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
