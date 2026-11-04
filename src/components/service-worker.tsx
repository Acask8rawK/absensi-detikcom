"use client";

import { useEffect } from "react";

// Mendaftarkan service worker hanya di production. Saat development, cache dari
// service worker justru membuat perubahan kode tidak langsung terlihat.
export function DaftarkanServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Gagal mendaftar tidak mengganggu aplikasi; hanya fitur offline yang hilang.
    });
  }, []);
  return null;
}
