"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { HasilAksi } from "@/lib/aksi";
import { cn } from "@/lib/utils";

/** Tombol submit yang nonaktif selama form diproses, supaya tidak terkirim dua kali. */
export function TombolKirim({
  children,
  teksProses = "Menyimpan…",
  className,
  variant,
  size,
}: {
  children: React.ReactNode;
  teksProses?: string;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className={className} variant={variant} size={size}>
      {pending ? teksProses : children}
    </Button>
  );
}

export type HasilForm = (NonNullable<HasilAksi> & { isian?: Record<string, string> }) | null;

/**
 * React 19 mengosongkan form setiap kali aksinya selesai, termasuk saat server
 * menolak isiannya. Pembungkus ini menyimpan isian yang tadi dikirim kalau aksi
 * gagal, lalu form memakainya sebagai defaultValue, jadi pengguna tidak perlu
 * mengetik ulang. Kolom kata sandi sengaja tidak ikut disimpan.
 */
export function pertahankanIsian(aksi: (sebelumnya: HasilAksi, formData: FormData) => Promise<HasilAksi>) {
  return async (sebelumnya: HasilForm, formData: FormData): Promise<HasilForm> => {
    const hasil = await aksi(sebelumnya, formData);
    if (!hasil || hasil.ok) return hasil;
    const isian: Record<string, string> = {};
    formData.forEach((nilai, nama) => {
      if (typeof nilai === "string" && !/sandi/i.test(nama)) isian[nama] = nilai;
    });
    return { ...hasil, isian };
  };
}

/** Menampilkan hasil aksi sebagai notifikasi, sekali untuk setiap hasil baru. */
export function useNotifikasiHasil(hasil: HasilAksi, setelahBerhasil?: () => void) {
  const terakhir = useRef<HasilAksi>(null);
  useEffect(() => {
    if (!hasil || hasil === terakhir.current) return;
    terakhir.current = hasil;
    if (hasil.ok) {
      toast.success(hasil.pesan);
      setelahBerhasil?.();
    } else {
      toast.error(hasil.pesan);
    }
  }, [hasil, setelahBerhasil]);
}

export function PesanGalat({ hasil, className }: { hasil: HasilAksi; className?: string }) {
  if (!hasil || hasil.ok) return null;
  return (
    <p role="alert" className={cn("text-sm text-destructive", className)}>
      {hasil.pesan}
    </p>
  );
}

export function Kolom({ label, htmlFor, petunjuk, children }: { label: string; htmlFor: string; petunjuk?: string; children: React.ReactNode }) {
  return (
    <div className="grid min-w-0 content-start gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {petunjuk && <p className="text-xs text-muted-foreground">{petunjuk}</p>}
    </div>
  );
}
