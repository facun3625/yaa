"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { BellIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStorePwa } from "@/components/store/store-pwa-provider";
import { useStorePush } from "@/components/store/use-store-push";

const DISMISSED_KEY = "yaa-store-push-dismissed";

// Modal centrado a propósito (no un banner de esquina): es lo primero que
// ve un cliente logueado la primera vez que abre la app ya instalada, y
// tiene que ser imposible de no ver.
export function StorePushBanner() {
  const { status } = useSession();
  const { isStandalone } = useStorePwa();
  const { subscribed, pending, enable } = useStorePush();
  const [dismissed, setDismissed] = useState(() => typeof window !== "undefined" && Boolean(localStorage.getItem(DISMISSED_KEY)));

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  }

  // Sin sesión no hay dónde guardar la suscripción (PushSubscription.userId
  // es obligatorio) — mejor no mostrar el modal que mostrarlo y fallar.
  const shouldShow =
    status === "authenticated" &&
    isStandalone &&
    !dismissed &&
    !subscribed &&
    typeof Notification !== "undefined" &&
    Notification.permission !== "denied";

  return (
    <Dialog open={shouldShow} onOpenChange={(open) => { if (!open) dismiss(); }}>
      <DialogContent className="text-center sm:max-w-xs">
        <DialogHeader className="items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <BellIcon className="size-6 text-primary" />
          </span>
          <DialogTitle>Activá las notificaciones</DialogTitle>
          <DialogDescription>Enterate primero de novedades y promos de la tienda.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:flex-col">
          <Button type="button" onClick={enable} disabled={pending} className="w-full">
            {pending ? "Activando..." : "Activar"}
          </Button>
          <Button type="button" variant="ghost" onClick={dismiss} className="w-full">
            Ahora no
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
