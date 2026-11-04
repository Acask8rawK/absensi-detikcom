// Service worker Hadir.
// Tugasnya sengaja sedikit: menyimpan aset statis supaya aplikasi cepat dibuka
// lagi, dan menampilkan halaman offline saat koneksi putus. Data absensi tidak
// pernah disimpan di sini; check-in selalu harus sampai ke server.

const CACHE = "hadir-v1";

// Simpan halaman offline beserta CSS/JS yang dipakainya, supaya halaman itu
// tetap tampil rapi walaupun belum pernah dibuka sebelumnya.
async function simpanHalamanOffline() {
  const cache = await caches.open(CACHE);
  const res = await fetch("/offline", { cache: "reload" });
  await cache.put("/offline", res.clone());
  const html = await res.text();
  const aset = new Set(html.match(/\/_next\/static\/[^"'\s)]+\.(?:css|js|woff2)/g) ?? []);
  await cache.addAll(["/ikon/192", ...aset]);
}

self.addEventListener("install", (event) => {
  event.waitUntil(simpanHalamanOffline().then(() => self.skipWaiting()));
});

// Hapus cache versi lama saat service worker baru aktif.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((kunci) => Promise.all(kunci.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Halaman selalu diambil dari jaringan karena isinya tergantung sesi dan jam.
  // Kalau gagal, barulah halaman offline yang ditampilkan.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/offline")));
    return;
  }

  // File di /_next/static punya nama unik per versi build, aman disimpan lama.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/ikon/")) {
    event.respondWith(
      caches.match(request).then(
        (tersimpan) =>
          tersimpan ||
          fetch(request).then((res) => {
            if (res.ok) {
              const salinan = res.clone();
              caches.open(CACHE).then((cache) => cache.put(request, salinan));
            }
            return res;
          }),
      ),
    );
  }
});
