import type { Metadata } from "next";
import { WifiOffIcon } from "lucide-react";
import { TombolCobaLagi } from "./tombol-coba-lagi";

export const metadata: Metadata = { title: "Offline" };

// Ditampilkan service worker saat ponsel tidak tersambung internet.
// Halaman ini statis dan tidak butuh login, jadi bisa disimpan di cache.
export default function Offline() {
  return (
    <main className="grid flex-1 place-items-center px-4 py-10">
      <div className="w-full max-w-sm text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
          <WifiOffIcon className="size-5" aria-hidden />
        </span>
        <h1 className="mt-4 text-xl font-bold tracking-tight">Kamu sedang offline</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Check-in dan check-out butuh koneksi, karena jamnya diambil dari server supaya tidak bisa diubah dari ponsel. Sambungkan internet lalu coba lagi.
        </p>
        <TombolCobaLagi />
      </div>
    </main>
  );
}
