/* Service worker: lưu sẵn toàn bộ trang để dùng khi mất mạng. Đổi CACHE khi phát hành bản mới. */
var CACHE = 'xdt-v4';
var ASSETS = [
  './', 'index.html', 'manifest.webmanifest', 'icons/icon.svg', 'css/style.css',
  'js/formulas.js', 'js/xlsx.js', 'js/core.js', 'js/app.js',
  'js/tools/vat-lieu.js', 'js/tools/hoan-thien.js', 'js/tools/tra-cuu.js', 'js/tools/du-toan.js', 'js/tools/bieu-mau.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// Trả bản đã lưu ngay, đồng thời tải bản mới ở nền cho lần mở sau
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (cache) {
    return cache.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(function () { return hit || (req.mode === 'navigate' ? cache.match('index.html') : undefined); });
      return hit || net;
    });
  }));
});
