// Service worker del panel admin (PWA). A propósito no maneja "fetch" ni
// cachea nada — esto es solo instalabilidad + push, no un PWA offline-first.
// Cachear un panel con stock/pedidos que cambian todo el tiempo es un
// riesgo aparte (datos viejos mostrados como si fueran actuales) que no
// vale la pena tomar acá.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = { title: "YAA", body: "Tenés una notificación nueva", url: "/admin" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // payload no era JSON, se usa el default de arriba
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/admin/icon/192",
      badge: "/admin/icon/192",
      data: { url: data.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/admin";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes("/admin") && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
