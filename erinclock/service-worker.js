const CACHE_NAME = 'clock-my-pwa-cache-v2';
const urlsToCache = [
  '../clock.js',
  './erinclock.html',
  './clock.css',
  './icon.svg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
