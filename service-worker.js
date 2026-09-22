const cacheName = "nomadic-ready-v10";
const offlinePage = "/index.html";
const appShell = [
  "/",
  "/index.html",
  "/app.html",
  "/guide.html",
  "/poems.html",
  "/guide.css",
  "/guide.js",
  "/install.js",
  "/manifest.webmanifest",
  "/media/nomadic-ready-icon.svg",
  "/media/nomadic-ready-180.png",
  "/media/nomadic-ready-192.png",
  "/media/nomadic-ready-512.png",
  "/media/nomadic-barber-global-mark.webp",
  "/media/nomadic-barber-grooming-guide-cover.jpg",
  "/media/true-love-cover.jpg"
];

// A page request for /app or /guide.html should come back as that page when
// offline, so navigations are cached under their own document key.
function documentKey(url) {
  if (url.pathname === "/" || url.pathname === "/index.html") return offlinePage;
  if (url.pathname === "/app") return "/app.html";
  return url.pathname;
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => Promise.all(
    appShell.map((path) => cache.add(path).catch(() => {}))
  )));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  if (event.request.method !== "GET" || requestUrl.pathname.startsWith("/api/")) return;

  if (event.request.mode === "navigate") {
    const key = documentKey(requestUrl);
    event.respondWith(fetch(event.request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(cacheName).then((cache) => cache.put(key, copy));
      }
      return response;
    }).catch(() => caches.match(key).then((cached) => cached || caches.match(offlinePage))));
    return;
  }

  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok && requestUrl.origin === self.location.origin) {
      const copy = response.clone();
      caches.open(cacheName).then((cache) => cache.put(event.request, copy));
    }
    return response;
  })));
});
