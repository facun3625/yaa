"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { BellIcon, XIcon } from "lucide-react";
import { useStorePwa } from "@/components/store/store-pwa-provider";
import { useStorePush } from "@/components/store/use-store-push";

const DISMISSED_KEY = "yaa-store-push-dismissed";

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
  // es obligatorio) — mejor no mostrar el banner que mostrarlo y fallar.
  if (status !== "authenticated") return null;
  if (!isStandalone || dismissed || subscribed) return null;
  if (typeof Notification === "undefined" || Notification.permission === "denied") return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 flex items-center gap-3 rounded-xl border bg-popover p-3 text-sm shadow-lg sm:inset-x-auto sm:right-4 sm:max-w-sm">
      <BellIcon className="size-5 shrink-0 text-primary" />
      <p className="flex-1 text-popover-foreground">Activá las notificaciones para enterarte de novedades y promos.</p>
      <button
        type="button"
        onClick={enable}
        disabled={pending}
        className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Activando..." : "Activar"}
      </button>
      <button type="button" onClick={dismiss} aria-label="Cerrar" className="shrink-0 text-muted-foreground hover:text-foreground">
        <XIcon className="size-4" />
      </button>
    </div>
  );
}
