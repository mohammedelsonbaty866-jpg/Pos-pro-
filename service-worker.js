/****************************************
 * PosPro – service-worker.js
 * Offline First PWA
 ****************************************/

const CACHE_NAME = "pospro-v1";

const ASSETS = [
  "/",
  "/index.html",
  "/login.html",
  "/css/app.css",
  "/js/firebase.js",
  "/js/auth.js",
  "/js/app.js",
  "/manifest.json"
];

/* =========================
   Install
   ========================= */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

/* =========================
   Activate
   ========================= */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => k !== CACHE_NAME && caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* =========================
   Fetch
   ========================= */
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(res => {
      return res || fetch(event.request).then(fetchRes => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchRes.clone());
          return fetchRes;
        });
      }).catch(() => caches.match("/index.html"));
    })
  );
});
