import { Suspense } from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RegistroForm } from "./registro-form";
import { AlreadyLoggedInBanner } from "./already-logged-in-banner";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "admin de una tienda",
  SUPER_ADMIN: "super admin de la plataforma",
};

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const session = await auth();

  // La sesión es JWT y no se refresca sola — si el token es viejo puede
  // seguir diciendo "sin tienda" aunque en la base ya tenga una (ver
  // lib/require-onboarding.ts), así que acá también se manda a buscar el
  // estado real en vez de confiar en session.user.tenantId directo.
  const user = session?.user ? await prisma.user.findUnique({ where: { id: session.user.id } }) : null;

  // Volviendo de Google con un código de revendedor en la URL (ver
  // registro-form.tsx) — se guarda acá, antes de decidir a dónde seguir.
  if (ref && user && user.role === "CUSTOMER" && !user.tenantId && !user.pendingReferralCode) {
    await prisma.user.update({ where: { id: user.id }, data: { pendingReferralCode: ref } });
  }

  if (user && user.role === "CUSTOMER" && !user.tenantId) {
    // Se registró antes pero no terminó — lo mandamos directo a donde
    // quedó, en vez de hacerlo pasar por "Crear cuenta" de nuevo.
    if (user.onboardingPaidAt) redirect("/registro/datos");
    if (user.pendingPlanId) redirect("/registro/pago");
    // Ya eligió "ser socio" antes (tiene código) y no está a mitad de crear
    // una tienda — no tiene sentido volver a preguntarle "¿qué querés
    // hacer?" cada vez que entra. Directo a su panel; "crear mi tienda"
    // sigue disponible ahí como un link, no como una pregunta obligatoria.
    if (user.referralCode) redirect("/socios");
    redirect("/registro/elegir");
  }

  const alreadyLoggedIn = user && (user.role !== "CUSTOMER" || user.tenantId)
    ? { email: user.email, label: ROLE_LABELS[user.role] ?? "cliente de una tienda" }
    : null;

  return (
    <main className="min-h-screen bg-[#030712] text-white lg:grid lg:grid-cols-2">
      {/* Panel de marca — solo desktop. En mobile alcanza con el logo del
          card del form, no hace falta duplicar la propuesta de valor. */}
      <section className="relative hidden overflow-hidden border-r border-white/10 lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-12 xl:px-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,90,54,0.16),transparent_55%)]"
        />

        <Image src="/yaa-logo-clean.svg" alt="yaa" width={835} height={478} className="relative h-8 w-auto object-contain" />

        <div className="relative max-w-md">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.18em] text-[#ff5a36]">
            Pedidos online para gastronomía y negocios de cercanía
          </p>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight xl:text-4xl">
            Tu propia tienda online, lista en minutos.
          </h1>
          <p className="mt-5 leading-relaxed text-white/60">
            Publicá tu catálogo, recibí pedidos y cobrá como quieras. Sin instalaciones, sin técnicos y sin comisión por venta.
          </p>

          <ul className="mt-7 flex flex-col gap-2.5 text-sm text-white/70">
            <li className="flex items-center gap-2"><Check className="size-4 shrink-0 text-[#ff7658]" />0% de comisión sobre tus ventas</li>
            <li className="flex items-center gap-2"><Check className="size-4 shrink-0 text-[#ff7658]" />10 días para probar, sin tarjeta</li>
            <li className="flex items-center gap-2"><Check className="size-4 shrink-0 text-[#ff7658]" />Cancelás cuando quieras</li>
          </ul>

          <Image
            src="/yaa_mock.png"
            alt="Tienda YAA vista en computadora y celular"
            width={1448}
            height={1086}
            className="mt-10 h-auto w-full max-w-md object-contain"
          />
        </div>

        <p className="relative text-xs text-white/35">yaa — pedidos online sin comisión</p>
      </section>

      {/* Panel del formulario */}
      <section className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="flex w-full max-w-sm flex-col gap-0 overflow-hidden rounded-2xl bg-[#0b1220] shadow-2xl ring-1 ring-white/10">
          <div className="flex flex-col items-center gap-3 px-6 py-7 text-center">
            <Image src="/yaa-logo-clean.svg" alt="yaa" width={835} height={478} className="h-8 w-auto object-contain lg:hidden" />
            <div className="flex flex-col items-center gap-0.5">
              <h2 className="text-xl font-semibold">Creá tu tienda</h2>
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
      </section>
    </main>
  );
}
