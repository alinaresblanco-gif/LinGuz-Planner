const CACHE_VERSION = "linguz-shell-v20260514-2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./imagenes/logo_linguz.png",
  "./vistas/mi-lista.html",
  "./vistas/mi-menu.html",
  "./vistas/nuestra-agenda.html",
  "./vistas/nuestras-recetas.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, responseToCache));
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request, { ignoreSearch: true });
        if (cached) {
          return cached;
        }

        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }

        throw new Error("Recurso no disponible en red ni en caché");
      })
  );
});
