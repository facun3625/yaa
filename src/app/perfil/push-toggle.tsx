"use client";

import { BellIcon, BellOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStorePwa } from "@/components/store/store-pwa-provider";
import { useStorePush } from "@/components/store/use-store-push";

// Control manual para quien cerró el banner o instaló la app más tarde —
// mismo hook que StorePushBanner, así que activar/desactivar acá o desde el
// banner queda sincronizado (misma clave de localStorage).
export function PushToggle() {
  const { isStandalone, canInstall, promptInstall } = useStorePwa();
  const { subscribed, pending, enable, disable } = useStorePush();

  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-center gap-3">
        {subscribed ? (
          <BellIcon className="size-5 shrink-0 text-primary" />
        ) : (
          <BellOffIcon className="size-5 shrink-0 text-muted-foreground" />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium">Notificaciones</p>
          <p className="text-sm text-muted-foreground">
            {subscribed
              ? "Vas a recibir novedades y promos de la tienda."
              : isStandalone
                ? "Activalas para enterarte de novedades y promos."
                : "Instalá la app para poder activarlas."}
          </p>
        </div>
      </div>
      {isStandalone ? (
        <Button
          type="button"
          variant={subscribed ? "outline" : "default"}
          size="sm"
          disabled={pending}
          onClick={subscribed ? disable : enable}
        >
          {pending ? "Un momento..." : subscribed ? "Desactivar" : "Activar"}
        </Button>
      ) : canInstall ? (
        <Button type="button" variant="outline" size="sm" onClick={promptInstall}>
          Instalar app
        </Button>
      ) : null}
    </div>
  );
}
