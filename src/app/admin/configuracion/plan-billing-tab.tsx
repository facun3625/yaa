import type { BillingPayment, Plan, Tenant } from "@/generated/prisma/client";
import { BILLING_STATUS_LABELS, BILLING_STATUS_COLORS } from "@/lib/billing-status";
import { startPlanChangeRequest } from "./actions";

type TenantWithBilling = Tenant & {
  plan: Plan | null;
  requestedPlan: Plan | null;
  billingPayments: BillingPayment[];
};

export function PlanBillingTab({ tenant }: { tenant: TenantWithBilling }) {
  const dateFormatter = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Plan actual</p>
            <p className="text-lg font-semibold">{tenant.plan?.name ?? "Sin plan asignado"}</p>
            {tenant.plan && (
              <p className="text-sm text-muted-foreground">
                ${Number(tenant.plan.priceMonthly).toLocaleString("es-AR")} / mes
              </p>
            )}
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${BILLING_STATUS_COLORS[tenant.billingStatus] ?? ""}`}
          >
            {BILLING_STATUS_LABELS[tenant.billingStatus] ?? tenant.billingStatus}
          </span>
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground">Próximo vencimiento</p>
          <p className="text-sm">{tenant.nextBillingDate ? dateFormatter.format(new Date(tenant.nextBillingDate)) : "Sin registrar"}</p>
        </div>
        {/* `Tenant.billingNotes` NO va acá: son notas internas del super
        admin sobre este cliente (ver billing-panel.tsx, "Notas internas") —
        mostrárselas al dueño de la tienda sería exponerle comentarios
        privados sobre su propia cuenta. Si en algún momento hace falta un
        campo de "forma de pago" visible para el cliente, tiene que ser uno
        nuevo y separado de este. */}

        {tenant.requestedPlan ? (
          <p className="mt-4 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400">
            Pediste pasar a <strong>{tenant.requestedPlan.name}</strong> — nuestro equipo lo va a confirmar y
            aplicar en breve.
          </p>
        ) : (
          <form action={startPlanChangeRequest}>
            <button
              type="submit"
              className="mt-4 inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Quiero cambiar de plan
            </button>
          </form>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Historial de pagos</p>
        {tenant.billingPayments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay pagos registrados.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium">Período</th>
                  <th className="px-3 py-2 font-medium">Monto</th>
                  <th className="px-3 py-2 font-medium">Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tenant.billingPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-3 py-2">{dateFormatter.format(new Date(payment.paidAt))}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {dateFormatter.format(new Date(payment.periodStart))} – {dateFormatter.format(new Date(payment.periodEnd))}
                    </td>
                    <td className="px-3 py-2 font-medium">${Number(payment.amount).toLocaleString("es-AR")}</td>
                    <td className="px-3 py-2 text-muted-foreground">{payment.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
