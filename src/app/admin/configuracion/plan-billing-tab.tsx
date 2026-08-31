import type { BillingPayment, Plan, Tenant } from "@/generated/prisma/client";
import { BILLING_STATUS_LABELS, BILLING_STATUS_COLORS } from "@/lib/billing-status";

type TenantWithBilling = Tenant & { plan: Plan | null; billingPayments: BillingPayment[] };

const CHANGE_PLAN_EMAIL =
  "mailto:hola@yaa.com.ar?subject=Quiero%20cambiar%20de%20plan&body=Hola%2C%20quiero%20cambiar%20el%20plan%20de%20mi%20tienda.";

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

        <a
          href={CHANGE_PLAN_EMAIL}
          className="mt-4 inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Quiero cambiar de plan
        </a>
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
