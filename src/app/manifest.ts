import type { MetadataRoute } from "next";

// Manifest PWA: membuat Hadir bisa dipasang di layar utama ponsel
// dan dibuka tanpa bilah alamat browser.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hadir · Absensi Magang",
    short_name: "Hadir",
    description: "Check-in, check-out, izin, dan riwayat kehadiran peserta magang.",
    lang: "id",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F5F7F4",
    theme_color: "#1E4636",
    icons: [
      { src: "/ikon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/ikon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/ikon/maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
