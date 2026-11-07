// Service worker simples: guarda as páginas visitadas e os arquivos estáticos para abrir sem internet.
const CACHE = "cc-v1"

self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (e) => {
  const { request } = e
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return
  e.respondWith(
    fetch(request)
      .then((r) => {
        if (r.ok && r.type === "basic") {
          const copia = r.clone()
          caches.open(CACHE).then((c) => c.put(request, copia))
        }
        return r
      })
      .catch(() => caches.match(request).then((m) => m ?? caches.match("/")))
  )
})
