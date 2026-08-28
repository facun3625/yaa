import Image from "next/image";
import QRCode from "qrcode";

import { prisma } from "@/lib/prisma";
import { requireReseller } from "@/lib/require-reseller";
import { BILLING_STATUS_LABELS, BILLING_STATUS_COLORS } from "@/lib/billing-status";
import { getResellerTierPercent } from "@/lib/reseller-commission";
import { CopyLinkButton, SetPasswordForm } from "./socio-tools";

const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? "localhost:3010";

export default async function SociosPage() {
  const { reseller } = await requireReseller();

  const protocol = ROOT_DOMAIN.startsWith("localhost") ? "http" : "https";
  const referralLink = `${protocol}://${ROOT_DOMAIN}/registro?ref=${reseller.referralCode}`;

  // QR generado acá mismo, sin depender de ningún servicio externo — nada
  // de mandarle el código de nadie a una API de terceros.
  const qrDataUrl = await QRCode.toDataURL(referralLink, {
    width: 320,
    margin: 1,
    color: { dark: "#1d1713", light: "#ffffff" },
  });

  const [referredTenants, commissions, currentTierPercent] = await Promise.all([
    prisma.tenant.findMany({
      where: { referredByResellerId: reseller.id },
      include: { plan: true, settings: { where: { key: "store_name" } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.resellerCommission.findMany({
      where: { resellerId: reseller.id },
      orderBy: { createdAt: "desc" },
    }),
    getResellerTierPercent(reseller.id),
  ]);

  const paidTotal = commissions.filter((c) => c.status === "PAID").reduce((sum, c) => sum + Number(c.amount), 0);
  const pendingTotal = commissions.filter((c) => c.status === "PENDING").reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <main className="min-h-screen bg-[#030712] px-4 py-12 text-white">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image src="/yaa-logo-clean.svg" alt="yaa" width={835} height={478} className="h-8 w-auto object-contain" />
          <div>
            <h1 className="text-xl font-semibold">Tu panel de socio</h1>
            <p className="text-sm text-white/50">Compartí tu código y seguí tus tiendas referidas.</p>
          </div>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold text-white/80">Tu código</h2>
          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URI generado en el servidor, no un asset optimizable por next/image */}
            <img src={qrDataUrl} alt={`Código QR de ${reseller.referralCode}`} className="size-40 shrink-0 rounded-xl bg-white p-2" />
            <div className="flex flex-1 flex-col gap-3">
              <div>
                <p className="text-xs text-white/40">Código</p>
                <p className="font-mono text-lg font-bold tracking-wider">{reseller.referralCode}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="min-w-0 flex-1 truncate rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/60">
                  {referralLink}
                </p>
                <CopyLinkButton link={referralLink} />
              </div>
              <p className="text-xs leading-relaxed text-white/40">
                Compartí el link o el QR. Cualquier tienda que se cree a través de tu código queda asociada a vos.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold text-white/80">Tiendas que trajiste ({referredTenants.length})</h2>
          {referredTenants.length === 0 ? (
            <p className="mt-3 text-sm text-white/40">Todavía no trajiste ninguna tienda. Compartí tu código para empezar.</p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-white/10">
              {referredTenants.map((tenant) => {
                const storeName = tenant.settings[0]?.value ?? tenant.subdomain;
                return (
                  <li key={tenant.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{storeName}</p>
                      <p className="text-xs text-white/40">
                        {tenant.subdomain}.{ROOT_DOMAIN} · {tenant.plan?.name ?? "Sin plan"}
                        {tenant.billingStatus === "ACTIVE" && tenant.nextBillingDate && tenant.plan && (
                          <>
                            {" "}· próximo cobro estimado{" "}
                            {new Date(tenant.nextBillingDate).toLocaleDateString("es-AR")} · ~$
                            {((Number(tenant.plan.priceMonthly) * currentTierPercent) / 100).toLocaleString("es-AR")}
                          </>
                        )}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${BILLING_STATUS_COLORS[tenant.billingStatus] ?? ""}`}
                    >
                      {BILLING_STATUS_LABELS[tenant.billingStatus] ?? tenant.billingStatus}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/80">Comisiones</h2>
            <span className="text-xs text-white/40">Tu escalón actual: {currentTierPercent}%</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-white/40">Cobrado</p>
              <p className="mt-1 text-2xl font-bold">${paidTotal.toLocaleString("es-AR")}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-white/40">Pendiente</p>
              <p className="mt-1 text-2xl font-bold text-[#ff7658]">${pendingTotal.toLocaleString("es-AR")}</p>
            </div>
          </div>
          {commissions.length === 0 ? (
            <p className="mt-4 text-sm text-white/40">
              Todavía no hay nada para mostrar acá — esta sección se activa cuando se registre el primer cobro de
              una tienda que trajiste.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-white/10">
              {commissions.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-white/70">
                    {c.type === "ACTIVATION_BONUS" ? "Bono de activación" : `Comisión recurrente (${c.percentApplied}%)`}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-medium">${Number(c.amount).toLocaleString("es-AR")}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        c.status === "PAID" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                      }`}
                    >
                      {c.status === "PAID" ? "Pagada" : "Pendiente"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Se registró con Google y no tiene contraseña propia todavía */}
        {!reseller.passwordHash && (
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-sm font-semibold text-white/80">Definir contraseña</h2>
            <p className="mt-1 mb-4 text-xs text-white/40">
              Entraste con Google — con eso alcanza. Si además querés poder entrar con contraseña, definila acá.
            </p>
            <SetPasswordForm />
          </section>
        )}
      </div>
    </main>
  );
}
