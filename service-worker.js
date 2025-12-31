/*********************************
 * PosPro Service Worker
 * Offline First + Cache Strategy
 *********************************/

const CACHE_NAME = "pospro-v1";

const ASSETS = [
  "/",
  "/index.html",
  "/login.html",
  "/manifest.json",

  "/css/app.css",

  "/js/firebase.js",
  "/js/auth.js",
  "/js/app.js",

  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

/* ===============================
   📦 Install
================================ */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📦 Caching app shell");
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

/* ===============================
   🔄 Activate
================================ */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ===============================
   🌐 Fetch
================================ */
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return (
        cached ||
        fetch(event.request)
          .then(res => {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
            return res;
          })
          .catch(() => caches.match("/index.html"))
      );
    })
  );
});
