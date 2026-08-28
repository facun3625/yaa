import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireOnboardingUser } from "@/lib/require-onboarding";
import { OnboardingSteps } from "../onboarding-steps";
import { createTenantFromOnboarding } from "./actions";

const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? "localhost:3010";

export default async function DatosPage() {
  const session = await requireOnboardingUser();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { pendingPlan: true },
  });
  if (!user?.pendingPlan) redirect("/registro/plan");
  if (!user.onboardingPaidAt) redirect("/registro/pago");

  return (
    <main className="min-h-screen bg-[#030712] px-4 py-12 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <OnboardingSteps current={4} />

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h1 className="text-xl font-bold">Ya casi — armemos tu tienda</h1>
          <p className="mt-1 text-sm text-white/50">Plan {user.pendingPlan.name} confirmado. Con esto queda lista.</p>

          <form action={createTenantFromOnboarding} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="storeName" className="text-xs font-medium text-white/60">Nombre del negocio</label>
              <input
                id="storeName"
                name="storeName"
                required
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#ff5a36] focus:ring-2 focus:ring-[#ff5a36]/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="subdomain" className="text-xs font-medium text-white/60">Subdominio</label>
              <div className="flex items-center overflow-hidden rounded-xl border border-white/15 bg-white/5 focus-within:border-[#ff5a36] focus-within:ring-2 focus-within:ring-[#ff5a36]/20">
                <input
                  id="subdomain"
                  name="subdomain"
                  required
                  placeholder="mi-negocio"
                  pattern="[a-z0-9\-]+"
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none"
                />
                <span className="shrink-0 pr-4 text-sm text-white/40">.{ROOT_DOMAIN}</span>
              </div>
            </div>

            {!user.passwordHash && (
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-xs font-medium text-white/60">
                  Definí una contraseña <span className="font-normal text-white/40">(opcional)</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  minLength={6}
                  placeholder="Mínimo 6 caracteres — dejalo vacío para entrar solo con Google"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#ff5a36] focus:ring-2 focus:ring-[#ff5a36]/20"
                />
                <p className="text-xs text-white/40">
                  Te registraste con Google — con eso alcanza para entrar a tu panel. Si además querés poder entrar
                  con contraseña, definila acá.
                </p>
              </div>
            )}

            <button type="submit" className="yaa-btn yaa-btn-primary mt-2 w-full justify-center">
              Crear mi tienda
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
