// HangiKapı servis çalışanı: uygulama kabuğunu saklar, internet yokken de açılır.
// Canlı veriler (nakordoni, hava, rota, haberler) hiç önbelleğe alınmaz.
const CACHE = 'hangikapi-v29';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return; // dış adresler: dokunma
  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    // önce internet (her zaman en yeni sürüm), olmazsa saklanan kopya
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
