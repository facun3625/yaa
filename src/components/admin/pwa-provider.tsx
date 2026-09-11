"use client";

import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { PwaIosInstallDialog } from "@/components/admin/pwa-ios-install-dialog";

type BeforeInstallPromptEvent = Event & {
  prompt: () => void;
};

type AdminPwaContextValue = {
  isStandalone: boolean;
  isIOS: boolean;
  canInstall: boolean;
  promptInstall: () => void;
};

const AdminPwaContext = createContext<AdminPwaContextValue>({
  isStandalone: false,
  isIOS: false,
  canInstall: false,
  promptInstall: () => {},
});

// Lecturas de APIs que solo existen en el browser (navigator, matchMedia).
// useSyncExternalStore, no useEffect+setState: evita el "set-state-in-effect"
// del lint y, más importante, evita el parpadeo de hidratación — React
// fuerza el primer render del cliente a usar getServerSnapshot (false) y
// recién después actualiza, igual que el server.
function subscribeNever() {
  return () => {};
}
function getIsIOSSnapshot() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}
function getServerSnapshotFalse() {
  return false;
}

function subscribeStandalone(callback: () => void) {
  const media = window.matchMedia("(display-mode: standalone)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function getStandaloneSnapshot() {
  return window.matchMedia("(display-mode: standalone)").matches;
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosDialogOpen, setIosDialogOpen] = useState(false);
  const isIOS = useSyncExternalStore(subscribeNever, getIsIOSSnapshot, getServerSnapshotFalse);
  const isStandalone = useSyncExternalStore(subscribeStandalone, getStandaloneSnapshot, getServerSnapshotFalse);

  useEffect(() => {
    navigator.serviceWorker?.register("/admin/sw.js", { scope: "/admin/" }).catch((error) => {
      console.error("No se pudo registrar el service worker del panel", error);
    });

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = useCallback(() => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      setDeferredPrompt(null);
      return;
    }
    if (isIOS) setIosDialogOpen(true);
  }, [deferredPrompt, isIOS]);

  const canInstall = !isStandalone && (deferredPrompt !== null || isIOS);

  return (
    <AdminPwaContext.Provider value={{ isStandalone, isIOS, canInstall, promptInstall }}>
      {children}
      <PwaIosInstallDialog open={iosDialogOpen} onOpenChange={setIosDialogOpen} />
    </AdminPwaContext.Provider>
  );
}

export function useAdminPwa() {
  return useContext(AdminPwaContext);
}
