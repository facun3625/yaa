// Service worker compartido por el panel admin (scope /admin) y el
// storefront de cada tienda (scope /) — cada registro es una instancia
// independiente aunque compartan este mismo archivo, así que todo acá
// abajo se apoya en self.registration.scope en vez de hardcodear "/admin".
// A propósito no maneja "fetch" ni cachea nada — esto es solo
// instalabilidad + push, no un PWA offline-first. Cachear datos que
// cambian todo el tiempo (stock, pedidos) es un riesgo aparte (datos
// viejos mostrados como si fueran actuales) que no vale la pena tomar acá.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  const scope = self.registration.scope; // termina en "/", ej. ".../admin" o ".../"
  const scopePath = new URL(scope).pathname;
  const iconPath = `${scopePath}${scopePath.endsWith("/") ? "" : "/"}icon/192`;
  let data = { title: "YAA", body: "Tenés una notificación nueva", url: scopePath };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // payload no era JSON, se usa el default de arriba
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: iconPath,
      badge: iconPath,
      data: { url: data.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const scopePath = new URL(self.registration.scope).pathname;
  const url = event.notification.data?.url || scopePath;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(scopePath) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
