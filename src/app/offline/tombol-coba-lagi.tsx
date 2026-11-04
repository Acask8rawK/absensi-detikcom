"use client";

import { Button } from "@/components/ui/button";

// Memuat ulang alamat yang tadi gagal dibuka, bukan pindah ke beranda.
export function TombolCobaLagi() {
  return (
    <Button className="mt-6 h-10 px-5" onClick={() => window.location.reload()}>
      Coba lagi
    </Button>
  );
}
