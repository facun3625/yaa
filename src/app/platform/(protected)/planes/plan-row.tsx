"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ArrowDownIcon, ArrowUpIcon, PencilIcon, StarIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useConfirm } from "@/components/admin/confirm-provider";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { updatePlan, togglePlanActive, deletePlan, setFeaturedPlan, unfeaturePlan, movePlan } from "./actions";

export type PlanRowData = {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number | null;
  trialDays: number;
  maxProducts: number | null;
  maxOrdersPerMonth: number | null;
  allowCustomDomain: boolean;
  allowServices: boolean;
  allowLoyalty: boolean;
  allowStats: boolean;
  allowTelegram: boolean;
  featured: boolean;
  description: string | null;
  active: boolean;
  tenantCount: number;
};

const FEATURE_TOGGLES = [
  { name: "allowServices", label: "Servicios y consultas" },
  { name: "allowLoyalty", label: "Cupones y puntos" },
  { name: "allowStats", label: "Estadísticas" },
  { name: "allowTelegram", label: "Tab Telegram" },
] as const;

export function PlanRow({ plan, isFirst, isLast }: { plan: PlanRowData; isFirst: boolean; isLast: boolean }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [togglePending, startToggleTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const [featuredPending, startFeaturedTransition] = useTransition();
  const [movePending, startMoveTransition] = useTransition();
  const [allowCustomDomain, setAllowCustomDomain] = useState(plan.allowCustomDomain);
  const [features, setFeatures] = useState({
    allowServices: plan.allowServices,
    allowLoyalty: plan.allowLoyalty,
    allowStats: plan.allowStats,
    allowTelegram: plan.allowTelegram,
  });
  const confirm = useConfirm();

  function toggleFeatured() {
    startFeaturedTransition(async () => {
      try {
        await (plan.featured ? unfeaturePlan(plan.id) : setFeaturedPlan(plan.id));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error");
      }
    });
  }

  function move(direction: "up" | "down") {
    startMoveTransition(async () => {
      try {
        await movePlan(plan.id, direction);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error");
      }
    });
  }

  function save(formData: FormData) {
    startTransition(async () => {
      try {
        await updatePlan(plan.id, formData);
        setEditing(false);
        toast.success("Plan actualizado");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "No se pudo guardar");
      }
    });
  }

  async function remove() {
    const ok = await confirm({
      title: "Borrar plan",
      description: `¿Borrar "${plan.name}"? Esta acción no se puede deshacer.`,
      confirmLabel: "Borrar",
      destructive: true,
    });
    if (!ok) return;
    startDeleteTransition(async () => {
      try {
        await deletePlan(plan.id);
        toast.success("Plan eliminado");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "No se pudo borrar");
      }
    });
  }

  if (editing) {
    return (
      <form action={save} className="flex flex-col gap-3 rounded-lg border p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Nombre</Label>
            <Input name="name" defaultValue={plan.name} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Precio mensual</Label>
            <Input name="priceMonthly" type="number" min="0" step="0.01" defaultValue={plan.priceMonthly} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Precio anual (opcional)</Label>
            <Input name="priceAnnual" type="number" min="0" step="0.01" defaultValue={plan.priceAnnual ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Días de prueba</Label>
            <Input name="trialDays" type="number" min="0" max="365" step="1" defaultValue={plan.trialDays} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Máx. productos (opcional)</Label>
            <Input name="maxProducts" type="number" min="1" step="1" defaultValue={plan.maxProducts ?? ""} placeholder="Sin límite" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Máx. pedidos/mes (opcional)</Label>
            <Input name="maxOrdersPerMonth" type="number" min="1" step="1" defaultValue={plan.maxOrdersPerMonth ?? ""} placeholder="Sin límite" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Qué incluye el plan (opcional)</Label>
          <Textarea name="description" defaultValue={plan.description ?? ""} rows={5} placeholder="Una prestación por línea" />
          <p className="text-xs text-muted-foreground">Cada renglón se publica como un beneficio en la landing.</p>
        </div>
        <label className="flex items-center gap-2.5 text-sm">
          <Switch checked={allowCustomDomain} onCheckedChange={setAllowCustomDomain} />
          <input type="hidden" name="allowCustomDomain" value={String(allowCustomDomain)} />
          <div className="flex flex-col">
            <span className="font-medium">Permite dominio propio</span>
            <span className="text-xs text-muted-foreground">
              Habilita la sección de dominio propio en Configuración para las tiendas de este plan.
            </span>
          </div>
        </label>
        <div className="flex flex-col gap-2 border-t pt-3 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
          {FEATURE_TOGGLES.map((toggle) => (
            <label key={toggle.name} className="flex items-center gap-2.5 text-sm">
              <Switch
                checked={features[toggle.name]}
                onCheckedChange={(checked) => setFeatures((f) => ({ ...f, [toggle.name]: checked }))}
              />
              <input type="hidden" name={toggle.name} value={String(features[toggle.name])} />
              <span className="font-medium">{toggle.label}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{plan.name}</span>
          <span className="text-sm text-muted-foreground">{formatPrice(plan.priceMonthly)}/mes</span>
          {plan.priceAnnual !== null && <span className="text-sm text-muted-foreground">{formatPrice(plan.priceAnnual)}/año</span>}
          {!plan.active && <Badge variant="secondary">Inactivo</Badge>}
          {plan.featured && <Badge className="gap-1"><StarIcon className="size-3 fill-current" />Más elegido</Badge>}
          {plan.allowCustomDomain && <Badge variant="outline">Dominio propio</Badge>}
          <Badge variant="outline">{plan.tenantCount} {plan.tenantCount === 1 ? "tienda" : "tiendas"}</Badge>
        </div>
        {plan.description && <p className="whitespace-pre-line text-sm text-muted-foreground">{plan.description}</p>}
        <p className="text-xs text-muted-foreground">
          {plan.maxProducts ? `Hasta ${plan.maxProducts} productos` : "Productos sin límite"}
          {" · "}
          {plan.maxOrdersPerMonth ? `Hasta ${plan.maxOrdersPerMonth} pedidos/mes` : "Pedidos sin límite"}
          {plan.trialDays > 0
            ? ` · ${plan.trialDays} ${plan.trialDays === 1 ? "día" : "días"} de prueba`
            : " · Sin período de prueba"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <div className="flex flex-col">
          <Button type="button" size="sm" variant="ghost" className="h-4 px-1" disabled={isFirst || movePending} onClick={() => move("up")}>
            <ArrowUpIcon className="size-3.5" />
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-4 px-1" disabled={isLast || movePending} onClick={() => move("down")}>
            <ArrowDownIcon className="size-3.5" />
          </Button>
        </div>
        <Button
          type="button"
          size="sm"
          variant={plan.featured ? "default" : "ghost"}
          disabled={featuredPending}
          onClick={toggleFeatured}
          title={plan.featured ? "Quitar de \"Más elegido\"" : "Marcar como \"Más elegido\""}
        >
          <StarIcon className={cn("size-4", plan.featured && "fill-current")} />
        </Button>
        <Switch
          checked={plan.active}
          disabled={togglePending}
          onCheckedChange={(active) =>
            startToggleTransition(async () => {
              try {
                await togglePlanActive(plan.id, active);
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Error");
              }
            })
          }
        />
        <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(true)}>
          <PencilIcon className="size-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled={deletePending} onClick={remove}>
          <Trash2Icon className="size-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
