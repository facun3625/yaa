"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createPlan } from "./actions";

const FEATURE_TOGGLES = [
  { name: "allowServices", label: "Servicios y consultas" },
  { name: "allowLoyalty", label: "Cupones y puntos" },
  { name: "allowStats", label: "Estadísticas" },
  { name: "allowTelegram", label: "Tab Telegram" },
] as const;

export function NewPlanForm() {
  const [pending, startTransition] = useTransition();
  const [allowCustomDomain, setAllowCustomDomain] = useState(false);
  const [features, setFeatures] = useState({ allowServices: true, allowLoyalty: true, allowStats: true, allowTelegram: true });
  const formRef = useRef<HTMLFormElement>(null);

  function create(formData: FormData) {
    startTransition(async () => {
      try {
        await createPlan(formData);
        formRef.current?.reset();
        toast.success("Plan creado");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "No se pudo crear");
      }
    });
  }

  return (
    <form ref={formRef} action={create} className="flex flex-col gap-3 rounded-lg border border-dashed p-4">
      <p className="text-sm font-medium">Nuevo plan</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Nombre</Label>
          <Input name="name" placeholder="Ej: Pro" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Precio mensual</Label>
          <Input name="priceMonthly" type="number" min="0" step="0.01" placeholder="0" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Precio anual (opcional)</Label>
          <Input name="priceAnnual" type="number" min="0" step="0.01" placeholder="Ej: 100000" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Días de prueba</Label>
          <Input name="trialDays" type="number" min="0" max="365" step="1" defaultValue="0" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Máx. productos (opcional)</Label>
          <Input name="maxProducts" type="number" min="1" step="1" placeholder="Sin límite" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Máx. pedidos/mes (opcional)</Label>
          <Input name="maxOrdersPerMonth" type="number" min="1" step="1" placeholder="Sin límite" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Qué incluye el plan (opcional)</Label>
        <Textarea name="description" rows={5} placeholder={"Una prestación por línea. Ej:\nPedidos sin límite\nStock y estadísticas\nHasta 3 administradores"} />
        <p className="text-xs text-muted-foreground">Cada renglón se publica como un beneficio en la landing.</p>
      </div>
      <label className="flex items-center gap-2.5 text-sm">
        <Switch checked={allowCustomDomain} onCheckedChange={setAllowCustomDomain} />
        <input type="hidden" name="allowCustomDomain" value={String(allowCustomDomain)} />
        <span className="font-medium">Permite dominio propio</span>
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
      <Button type="submit" size="sm" disabled={pending} className="self-start">
        <PlusIcon className="size-4" />
        {pending ? "Creando..." : "Crear plan"}
      </Button>
    </form>
  );
}
