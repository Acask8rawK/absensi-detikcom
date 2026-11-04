import type { Metadata } from "next";
import { masukDemo } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { FormMasuk } from "./form-masuk";

export const metadata: Metadata = { title: "Masuk" };

const PESAN: Record<string, string> = {
  nonaktif: "Akunmu sudah dinonaktifkan. Hubungi admin magang.",
  sesi: "Sesimu sudah berakhir. Silakan masuk lagi.",
  demo: "Akun demo belum tersedia. Jalankan seed database terlebih dahulu.",
};

export default async function HalamanLogin({ searchParams }: PageProps<"/login">) {
  const { pesan } = await searchParams;
  const info = typeof pesan === "string" ? PESAN[pesan] : undefined;

  return (
    <main className="grid flex-1 place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-sampul text-lg font-bold text-sampul-teks" aria-hidden>
            H
          </span>
          <div>
            <h1 className="text-2xl leading-none font-bold tracking-tight">Hadir</h1>
            <p className="mt-1 text-sm text-muted-foreground">Catat kehadiran magangmu</p>
          </div>
        </div>

        <section className="rounded-[10px] border bg-card p-5">
          {info && (
            <p role="status" className="mb-4 rounded-md border border-st-keluar/40 bg-st-keluar/10 px-3 py-2 text-sm">
              {info}
            </p>
          )}
          <FormMasuk />
        </section>

        <section className="mt-6" aria-labelledby="judul-demo">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <h2 id="judul-demo" className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Coba tanpa mendaftar
            </h2>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="mt-4 grid gap-2">
            <form action={masukDemo.bind(null, "PESERTA")}>
              <Button type="submit" variant="outline" className="h-auto w-full justify-between px-4 py-3 text-left">
                <span>
                  <span className="block font-semibold">Masuk sebagai Peserta demo</span>
                  <span className="block text-xs font-normal text-muted-foreground">Check-in, check-out, riwayat, pengajuan</span>
                </span>
                <span aria-hidden>→</span>
              </Button>
            </form>
            <form action={masukDemo.bind(null, "ADMIN")}>
              <Button type="submit" variant="outline" className="h-auto w-full justify-between px-4 py-3 text-left">
                <span>
                  <span className="block font-semibold">Masuk sebagai Admin demo</span>
                  <span className="block text-xs font-normal text-muted-foreground">Dashboard, peserta, laporan, persetujuan</span>
                </span>
                <span aria-hidden>→</span>
              </Button>
            </form>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Semua nama dan data di aplikasi ini adalah data contoh. Akun demo juga bisa dipakai lewat form di atas:
            <span className="tabular-nums"> admin@hadir.id</span> atau <span className="tabular-nums">rina@peserta.hadir.id</span>, kata sandi{" "}
            <span className="tabular-nums">demo12345</span>.
          </p>
        </section>
      </div>
    </main>
  );
}
