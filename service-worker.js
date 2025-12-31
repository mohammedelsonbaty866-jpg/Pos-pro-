self.addEventListener('install',e=>{
 e.waitUntil(
  caches.open('pospro').then(c=>c.addAll([
   'index.html',
   'landing.html'
  ]))
 );
});

self.addEventListener('fetch',e=>{
 e.respondWith(
  caches.match(e.request).then(r=>r||fetch(e.request))
 );
});
