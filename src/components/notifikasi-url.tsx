"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const PESAN: Record<string, string> = {
  "sandi-diganti": "Kata sandi baru tersimpan.",
};

/** Menampilkan pesan yang dibawa lewat ?pesan=…, lalu membersihkan URL-nya. */
export function NotifikasiDariUrl() {
  const params = useSearchParams();
  const router = useRouter();
  const kode = params.get("pesan");

  useEffect(() => {
    if (!kode || !PESAN[kode]) return;
    toast.success(PESAN[kode]);
    const sisa = new URLSearchParams(params);
    sisa.delete("pesan");
    router.replace(sisa.size ? `?${sisa}` : window.location.pathname, { scroll: false });
  }, [kode, params, router]);

  return null;
}
