import { Suspense } from "react";
import Image from "next/image";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RegistroForm } from "./registro-form";
import { AlreadyLoggedInBanner } from "./already-logged-in-banner";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "admin de una tienda",
  SUPER_ADMIN: "super admin de la plataforma",
};

export default async function RegistroPage() {
  const session = await auth();

  // La sesión es JWT y no se refresca sola — si el token es viejo puede
  // seguir diciendo "sin tienda" aunque en la base ya tenga una (ver
  // lib/require-onboarding.ts), así que acá también se manda a buscar el
  // estado real en vez de confiar en session.user.tenantId directo.
  const user = session?.user ? await prisma.user.findUnique({ where: { id: session.user.id } }) : null;

  if (user && user.role === "CUSTOMER" && !user.tenantId) {
    // Se registró antes pero no terminó — lo mandamos directo a donde
    // quedó, en vez de hacerlo pasar por "Crear cuenta" de nuevo.
    if (user.onboardingPaidAt) redirect("/registro/datos");
    if (user.pendingPlanId) redirect("/registro/pago");
    redirect("/registro/plan");
  }

  const alreadyLoggedIn = user && (user.role !== "CUSTOMER" || user.tenantId)
    ? { email: user.email, label: ROLE_LABELS[user.role] ?? "cliente de una tienda" }
    : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#030712] px-4 py-12 text-white">
      <div className="flex w-full max-w-sm flex-col gap-0 overflow-hidden rounded-2xl bg-[#0b1220] shadow-2xl ring-1 ring-white/10">
        <div className="flex flex-col items-center gap-3 px-6 py-7 text-center">
          <Image src="/yaa-logo-clean.svg" alt="yaa" width={835} height={478} className="h-8 w-auto object-contain" />
          <div className="flex flex-col items-center gap-0.5">
            <h1 className="text-xl font-semibold">Creá tu tienda</h1>
            <p className="text-sm text-white/50">Empezá gratis, sin instalaciones.</p>
          </div>
        </div>

        <div className="h-px bg-white/10" />

        <div className="px-6 py-6">
          {alreadyLoggedIn && <AlreadyLoggedInBanner email={alreadyLoggedIn.email} label={alreadyLoggedIn.label} />}
          <Suspense>
            <RegistroForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
