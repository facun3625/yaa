"use client";

import { useState } from "react";
import { BellIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { useAdminPwa } from "@/components/admin/pwa-provider";
import { subscribeToPush } from "@/app/admin/actions";

const DISMISSED_KEY = "yaa-admin-push-dismissed";
// Distinto de DISMISSED_KEY a propósito: Notification.permission puede
// quedar en "granted" aunque el paso de subscribe()/subscribeToPush()
// falle después — si el banner se guiara por el permiso del navegador, en
// ese caso desaparecería para siempre sin haber guardado nada, sin forma
// de reintentar. Este flag solo se marca cuando la suscripción de verdad
// se guardó en la base.
const SUBSCRIBED_KEY = "yaa-admin-push-subscribed";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64Safe);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

export function PushPermissionBanner() {
  // isStandalone viene de useSyncExternalStore (ver pwa-provider.tsx): en el
  // primer render del cliente vale false igual que en el server, así que
  // este early-return evita cualquier lectura de Notification (inexistente
  // en el server) hasta después de que React ya hidrató sin desajustes.
  const { isStandalone } = useAdminPwa();
  const [dismissed, setDismissed] = useState(() => typeof window !== "undefined" && Boolean(localStorage.getItem(DISMISSED_KEY)));
  const [subscribed, setSubscribed] = useState(() => typeof window !== "undefined" && Boolean(localStorage.getItem(SUBSCRIBED_KEY)));
  const [pending, setPending] = useState(false);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  }

  // Ojo: Notification.requestPermission() tiene que ser la primera línea
  // acá — en iOS Safari, cualquier await/estado intermedio antes "gasta"
  // el gesto del click y el permiso falla en silencio.
  async function handleEnable() {
    setPending(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("No se activaron las notificaciones — hay que aceptar el permiso.");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error("Falta configurar NEXT_PUBLIC_VAPID_PUBLIC_KEY en el servidor");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const json = subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      await subscribeToPush(json);
      localStorage.setItem(SUBSCRIBED_KEY, "1");
      setSubscribed(true);
      toast.success("Notificaciones activadas");
    } catch (error) {
      console.error("No se pudo activar las notificaciones", error);
      toast.error(error instanceof Error ? error.message : "No se pudo activar las notificaciones");
    } finally {
      setPending(false);
    }
  }

  if (!isStandalone || dismissed || subscribed) return null;
  if (typeof Notification === "undefined" || Notification.permission === "denied") return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 flex items-center gap-3 rounded-xl border bg-popover p-3 text-sm shadow-lg sm:inset-x-auto sm:right-4 sm:max-w-sm">
      <BellIcon className="size-5 shrink-0 text-primary" />
      <p className="flex-1 text-popover-foreground">Activá las notificaciones para no perderte pedidos nuevos.</p>
      <button
        type="button"
        onClick={handleEnable}
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
