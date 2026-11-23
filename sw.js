/* Service worker : met en cache l'application pour jouer hors ligne.
   La liste des fichiers et la version sont injectées à la publication par
   `python3 tools/make_sw.py <dossier>` (workflow Pages). Sans injection (développement),
   la liste est vide et les fichiers sont mis en cache à la volée. */
const VERSION = /*SW_VERSION*/'dev';
const FILES = /*SW_FILES*/[];
const CACHE = 'osmrides-' + VERSION;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => (k.startsWith('t2z-') || k.startsWith('osmrides-')) && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  // Moteur chargé en ligne à une version (docs/versions.md) : gardé aussi, pour rejouer hors ligne après un premier lancement
  const u = new URL(r.url), moteur = u.origin === 'https://cdn.jsdelivr.net' && u.pathname.startsWith('/gh/qhess34/osmrides@');
  if (r.method !== 'GET' || (u.origin !== location.origin && !moteur)) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(r, { ignoreSearch: true });   // jeu.html?type=parc&lieu=asterix&el=zeus -> jeu.html
    if (hit) return hit;
    try {
      const res = await fetch(r);
      if (res.ok || (moteur && res.type === 'opaque')) c.put(r, res.clone());   // <script> d'un autre site : réponse opaque
      return res;
    } catch (err) {
      return (await c.match('index.html')) || Response.error();
    }
  }));
});
