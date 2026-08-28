import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/require-super-admin";
import {
  updateResellerSettings,
  createTier,
  deleteTier,
  markCommissionPaid,
  deactivateReseller,
  reactivateReseller,
} from "./actions";

export default async function RevendedoresPage() {
  await requireSuperAdmin();

  const [settings, tiers, resellers] = await Promise.all([
    prisma.resellerSettings.upsert({
      where: { id: "global" },
      update: {},
      create: { id: "global" },
    }),
    prisma.resellerCommissionTier.findMany({ orderBy: { minActiveStores: "asc" } }),
    prisma.user.findMany({
      // Ser revendedor es tener un código, no un rol — puede ser alguien
      // sin tienda todavía o admin de su propia tienda que además reparte
      // su código (ver lib/require-reseller.ts).
      where: { referralCode: { not: null } },
      include: {
        referredTenants: { select: { id: true, billingStatus: true } },
        resellerCommissions: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8 p-6">
      <div>
        <h1 className="text-xl font-semibold">Revendedores</h1>
        <p className="text-sm text-muted-foreground">Condiciones del programa y comisiones de cada socio.</p>
      </div>

      <section className="rounded-2xl border bg-card p-6">
        <h2 className="text-sm font-semibold">Bono por activación</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Se paga una sola vez por tienda, cuando lleva esta cantidad de días desde que se creó siendo tienda
          referida. Estos mismos valores se muestran en la página pública de /revendedores.
        </p>
        <form action={updateResellerSettings} className="mt-4 flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Monto del bono</label>
            <input
              name="activationBonusAmount"
              type="number"
              min="0"
              step="0.01"
              defaultValue={settings.activationBonusAmount.toString()}
              className="w-40 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Días de pago seguido</label>
            <input
              name="activationBonusDays"
              type="number"
              min="1"
              defaultValue={settings.activationBonusDays}
              className="w-32 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button type="submit" className="yaa-btn yaa-btn-primary h-[38px]">
            Guardar
          </button>
        </form>
      </section>

      <section className="rounded-2xl border bg-card p-6">
        <h2 className="text-sm font-semibold">Escalones de comisión</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Desde cuántas tiendas activas de un revendedor se aplica cada porcentaje. El escalón que corresponde en
          cada cobro es el de mayor umbral que no supere la cantidad de tiendas activas en ese momento.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {tiers.map((tier) => (
            <div key={tier.id} className="flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm">
              <span>
                Desde <strong>{tier.minActiveStores}</strong> tiendas activas → <strong>{tier.percent.toString()}%</strong>
              </span>
              <form action={deleteTier.bind(null, tier.id)}>
                <button type="submit" className="text-xs text-destructive hover:underline">
                  Borrar
                </button>
              </form>
            </div>
          ))}
          <form action={createTier} className="flex items-end gap-3 rounded-xl border border-dashed p-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Desde tiendas activas</label>
              <input name="minActiveStores" type="number" min="0" required className="w-32 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Porcentaje</label>
              <input name="percent" type="number" min="0" max="100" step="0.1" required className="w-28 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <button type="submit" className="yaa-btn yaa-btn-secondary h-[38px]">
              Agregar escalón
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-6">
        <h2 className="text-sm font-semibold">Revendedores ({resellers.length})</h2>
        {resellers.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Todavía no se registró ningún revendedor.</p>
        ) : (
          <div className="mt-4 flex flex-col divide-y">
            {resellers.map((reseller) => {
              const activeCount = reseller.referredTenants.filter((t) => t.billingStatus === "ACTIVE").length;
              const pending = reseller.resellerCommissions.filter((c) => c.status === "PENDING");
              const paid = reseller.resellerCommissions.filter((c) => c.status === "PAID");
              const pendingTotal = pending.reduce((sum, c) => sum + Number(c.amount), 0);
              const paidTotal = paid.reduce((sum, c) => sum + Number(c.amount), 0);

              return (
                <div key={reseller.id} className="flex flex-col gap-3 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{reseller.name ?? reseller.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {reseller.email} · código {reseller.referralCode}
                        {reseller.resellerDeactivatedAt && " (desactivado)"} · {reseller.referredTenants.length} tiendas traídas ({activeCount} activas)
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-right text-xs">
                      <div>
                        <p className="text-muted-foreground">Pagado</p>
                        <p className="font-semibold">${paidTotal.toLocaleString("es-AR")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pendiente</p>
                        <p className="font-semibold text-amber-600 dark:text-amber-400">${pendingTotal.toLocaleString("es-AR")}</p>
                      </div>
                      {reseller.resellerDeactivatedAt ? (
                        <form action={reactivateReseller.bind(null, reseller.id)}>
                          <button type="submit" className="text-xs text-primary hover:underline">
                            Reactivar
                          </button>
                        </form>
                      ) : (
                        <form action={deactivateReseller.bind(null, reseller.id)}>
                          <button type="submit" className="text-xs text-destructive hover:underline">
                            Desactivar
                          </button>
                        </form>
                      )}
                    </div>
                  </div>

                  {pending.length > 0 && (
                    <div className="flex flex-col gap-1.5 rounded-lg bg-muted/50 p-3">
                      {pending.map((c) => (
                        <div key={c.id} className="flex items-center justify-between text-xs">
                          <span>
                            {c.type === "ACTIVATION_BONUS" ? "Bono de activación" : `Comisión (${c.percentApplied}%)`} —{" "}
                            ${Number(c.amount).toLocaleString("es-AR")}
                          </span>
                          <form action={markCommissionPaid.bind(null, c.id)}>
                            <button type="submit" className="text-primary hover:underline">
                              Marcar pagada
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
