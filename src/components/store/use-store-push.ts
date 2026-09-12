"use client";

import { useState } from "react";
import { toast } from "sonner";
import { subscribeToCustomerPush, unsubscribeFromCustomerPush } from "@/app/actions/push";

// Distinta de cualquier flag de "banner cerrado": solo se marca cuando la
// suscripción de verdad se guardó en la base, para que banner y toggle de
// /perfil compartan el mismo estado de verdad (a nivel de este dispositivo).
const SUBSCRIBED_KEY = "yaa-store-push-subscribed";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64Safe);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

// Sin navigator.serviceWorker.ready (espera a que la página esté
// *controlada*, cosa que solo pasa en la navegación siguiente a la que
// registró el worker) — register() ya expone pushManager apenas el worker
// está activo, y es idempotente si ya existe.
async function getActiveRegistration(): Promise<ServiceWorkerRegistration> {
  const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  if (registration.active) return registration;

  const worker = registration.installing ?? registration.waiting;
  if (!worker) throw new Error("El service worker no se pudo iniciar");
  await new Promise<void>((resolve) => {
    worker.addEventListener("statechange", () => {
      if (worker.state === "activated") resolve();
    });
  });
  return registration;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} no respondió a tiempo`)), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); },
    );
  });
}

export function useStorePush() {
  const [subscribed, setSubscribed] = useState(
    () => typeof window !== "undefined" && Boolean(localStorage.getItem(SUBSCRIBED_KEY)),
  );
  const [pending, setPending] = useState(false);

  // Notification.requestPermission() tiene que ser la primera línea acá —
  // en iOS Safari, cualquier await/estado intermedio antes "gasta" el
  // gesto del click y el permiso falla en silencio.
  async function enable() {
    setPending(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("No se activaron las notificaciones — hay que aceptar el permiso.");
        return;
      }
      const registration = await withTimeout(getActiveRegistration(), 8000, "El service worker");
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error("Falta configurar NEXT_PUBLIC_VAPID_PUBLIC_KEY en el servidor");
      const subscription = await withTimeout(
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }),
        8000,
        "La suscripción push",
      );
      const json = subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      await withTimeout(subscribeToCustomerPush(json), 8000, "El guardado en el servidor");
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

  async function disable() {
    setPending(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration("/");
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await unsubscribeFromCustomerPush(subscription.endpoint);
        await subscription.unsubscribe();
      }
      localStorage.removeItem(SUBSCRIBED_KEY);
      setSubscribed(false);
      toast.success("Notificaciones desactivadas");
    } catch (error) {
      console.error("No se pudieron desactivar las notificaciones", error);
      toast.error(error instanceof Error ? error.message : "No se pudieron desactivar las notificaciones");
    } finally {
      setPending(false);
    }
  }

  return { subscribed, pending, enable, disable };
}
