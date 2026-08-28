import Image from "next/image";
import { Store, Users, LayoutDashboard } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireOnboardingUser } from "@/lib/require-onboarding";
import { becomeReseller } from "./actions";

export default async function ElegirPage() {
  // Esto también reverifica contra la base (no confía en la sesión vieja) y
  // manda de vuelta a /registro si el usuario ya no corresponde acá — por
  // ejemplo, si ya es admin de una tienda.
  const session = await requireOnboardingUser();

  // Ser socio no le impide crear una tienda después (ver
  // lib/require-reseller.ts) — si ya tiene código, esta pantalla se lo
  // recuerda en vez de ofrecerle generar uno nuevo.
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const isAlreadyReseller = !!user?.referralCode;

  return (
    <main className="min-h-screen bg-[#030712] px-4 py-12 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8">
        <Image src="/yaa-logo-clean.svg" alt="yaa" width={835} height={478} className="h-8 w-auto object-contain" />

        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-xl font-semibold">¿Qué querés hacer?</h1>
          <p className="text-sm text-white/50">Elegí una opción para seguir.</p>
        </div>

        <div className="flex w-full flex-col gap-4">
          <a
            href="/registro/plan"
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-[#ff5a36]/50 hover:bg-white/[0.05]"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#ff5a36]/15 text-[#ff7658]">
              <Store className="size-6" />
            </div>
            <div className="flex flex-col gap-0.5 text-left">
              <span className="font-semibold">Crear mi tienda</span>
              <span className="text-xs text-white/50">Elegí un plan y empezá a vender online.</span>
            </div>
          </a>

          {isAlreadyReseller ? (
            <a
              href="/socios"
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-[#ff5a36]/50 hover:bg-white/[0.05]"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#ff5a36]/15 text-[#ff7658]">
                <LayoutDashboard className="size-6" />
              </div>
              <div className="flex flex-col gap-0.5 text-left">
                <span className="font-semibold">Ver mi panel de socio</span>
                <span className="text-xs text-white/50">Ya tenés tu código — entrá a ver tus tiendas y comisiones.</span>
              </div>
            </a>
          ) : (
            <form action={becomeReseller}>
              <button
                type="submit"
                className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition-colors hover:border-[#ff5a36]/50 hover:bg-white/[0.05]"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#ff5a36]/15 text-[#ff7658]">
                  <Users className="size-6" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold">Ser socio comercial</span>
                  <span className="text-xs text-white/50">Recomendá yaa y ganá una comisión por cada tienda que traigas.</span>
                </div>
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
