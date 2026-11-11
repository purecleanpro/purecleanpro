/* PURE CLEAN PRO - service worker
   Troque o número da versão abaixo quando mudar os ícones ou o manifesto. */
const VERSAO = 'estoque-v4';
const ARQUIVOS = ['./', 'index.html', 'manifest.webmanifest',
  'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'icon-180.png', 'favicon-48.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;   // Firebase e WhatsApp passam direto
  if (r.mode === 'navigate' || u.pathname.endsWith('.html')) {       // página: tenta a internet primeiro (pega atualizações)
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(VERSAO).then(x => x.put('index.html', c)); return res; })
      .catch(() => caches.match('index.html').then(m => m || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const c = res.clone(); caches.open(VERSAO).then(x => x.put(r, c)); return res; })));
});
