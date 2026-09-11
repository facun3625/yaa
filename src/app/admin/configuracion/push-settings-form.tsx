"use client";

import { useTransition } from "react";
import { BellIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { sendTestPush } from "@/app/admin/actions";

export function PushSettingsForm() {
  const [pending, startTransition] = useTransition();

  function sendTest() {
    startTransition(async () => {
      try {
        const { sent } = await sendTestPush();
        if (sent) {
          toast.success("Notificación enviada — revisá tu celular");
        } else {
          toast.error("Todavía no activaste las notificaciones en este dispositivo — instalá la app y activalas primero.");
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "No se pudo enviar la notificación de prueba");
      }
    });
  }

  return (
    <div className="grid max-w-3xl gap-6 rounded-xl border p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <BellIcon className="size-5" />
        </span>
        <div>
          <h2 className="font-semibold">Notificaciones push</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Avisa a cada admin que instaló el panel como app cuando entra un pedido nuevo. Se activa desde el celular:
            instalá la app con &quot;Instalar app&quot; en el menú, y después aceptá el permiso de notificaciones que
            aparece al abrirla.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={sendTest} disabled={pending}>
          {pending ? "Enviando..." : "Enviar notificación de prueba"}
        </Button>
      </div>
    </div>
  );
}
