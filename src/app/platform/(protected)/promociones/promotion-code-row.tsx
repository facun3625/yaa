"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { togglePromotionCode } from "./actions";

const dateFormatter = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" });

export function PromotionCodeRow({ promotion }: { promotion: {
  id: string;
  code: string;
  description: string | null;
  durationMonths: number;
  active: boolean;
  usedCount: number;
  maxUses: number | null;
  validUntil: string | null;
} }) {
  const [pending, startTransition] = useTransition();
  const exhausted = promotion.maxUses !== null && promotion.usedCount >= promotion.maxUses;
  const expired = promotion.validUntil !== null && new Date(promotion.validUntil) < new Date();

  function toggle(active: boolean) {
    startTransition(async () => {
      try {
        await togglePromotionCode(promotion.id, active);
        toast.success(active ? "Código activado" : "Código pausado");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo actualizar");
      }
    });
  }

  return (
    <article className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <code className="rounded-md bg-primary/10 px-2 py-1 text-sm font-bold text-primary">{promotion.code}</code>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
            {promotion.durationMonths} {promotion.durationMonths === 1 ? "mes" : "meses"} bonificados
          </span>
          {expired && <span className="text-xs font-semibold text-destructive">Vencido</span>}
          {exhausted && <span className="text-xs font-semibold text-destructive">Sin usos disponibles</span>}
        </div>
        {promotion.description && <p className="mt-2 text-sm text-muted-foreground">{promotion.description}</p>}
        <p className="mt-1 text-xs text-muted-foreground">
          Usos: {promotion.usedCount}{promotion.maxUses !== null ? ` de ${promotion.maxUses}` : " · sin límite"}
          {promotion.validUntil ? ` · vence ${dateFormatter.format(new Date(promotion.validUntil))}` : " · sin vencimiento"}
        </p>
      </div>
      <label className="flex shrink-0 items-center gap-2 text-sm font-medium">
        <Switch checked={promotion.active} onCheckedChange={toggle} disabled={pending || exhausted || expired} />
        {promotion.active ? "Activo" : "Pausado"}
      </label>
    </article>
  );
}
