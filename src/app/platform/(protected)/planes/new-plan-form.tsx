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

export function NewPlanForm() {
  const [pending, startTransition] = useTransition();
  const [allowCustomDomain, setAllowCustomDomain] = useState(false);
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Nombre</Label>
          <Input name="name" placeholder="Ej: Pro" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Precio mensual</Label>
          <Input name="priceMonthly" type="number" min="0" step="0.01" placeholder="0" required />
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
        <Label className="text-xs">Descripción (opcional)</Label>
        <Textarea name="description" rows={2} placeholder="Qué incluye este plan..." />
      </div>
      <label className="flex items-center gap-2.5 text-sm">
        <Switch checked={allowCustomDomain} onCheckedChange={setAllowCustomDomain} />
        <input type="hidden" name="allowCustomDomain" value={String(allowCustomDomain)} />
        <span className="font-medium">Permite dominio propio</span>
      </label>
      <Button type="submit" size="sm" disabled={pending} className="self-start">
        <PlusIcon className="size-4" />
        {pending ? "Creando..." : "Crear plan"}
      </Button>
    </form>
  );
}
