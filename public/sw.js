// Offline support for the health dashboard.
// Bump CACHE when this file changes to retire old caches on activate.
const CACHE = "phd-v1";
const OFFLINE_URLS = ["/"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(OFFLINE_URLS)).catch(() => {})
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key !== CACHE) await caches.delete(key);
      }
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Immutable, content-hashed build assets: cache-first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
            return res;
          })
      )
    );
    return;
  }

  // Page navigations: network-first (fresh data when online), cache fallback offline.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          caches.open(CACHE).then((c) => c.put(req, fresh.clone()));
          return fresh;
        } catch {
          return (
            (await caches.match(req)) ||
            (await caches.match("/")) ||
            Response.error()
          );
        }
      })()
    );
    return;
  }

  // Everything else same-origin (data payloads, icons): network-first, cache fallback.
  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.status === 200) {
          caches.open(CACHE).then((c) => c.put(req, fresh.clone()));
        }
        return fresh;
      } catch {
        return (await caches.match(req)) || Response.error();
      }
    })()
  );
});
