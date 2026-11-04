import type { Metadata } from "next";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { wajibPeran } from "@/lib/auth";
import { dataDaftarPeserta } from "@/lib/data";
import { formatJam, formatTanggalPendek, tanggalWIB } from "@/lib/waktu";
import { TambahPeserta, TombolStatusPeserta } from "@/components/admin/kelola-peserta";
import { GulirSamping } from "@/components/gulir-samping";
import { Inisial, KepalaKolom } from "@/components/rapor";
import { LencanaStatus } from "@/components/status";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Peserta" };

export default async function DaftarPeserta({ searchParams }: PageProps<"/admin/peserta">) {
  await wajibPeran("ADMIN");
  const sp = await searchParams;
  const cari = typeof sp.cari === "string" ? sp.cari.trim().slice(0, 60) : "";
  const hariIni = tanggalWIB();
  const peserta = await dataDaftarPeserta(cari, hariIni);

  return (
    <div className="grid gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Peserta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {peserta.filter((p) => p.aktif).length} aktif · kehadiran dihitung untuk bulan ini
          </p>
        </div>
        <TambahPeserta hariIni={hariIni} />
      </header>

      <form className="relative max-w-sm" role="search">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <label htmlFor="cari" className="sr-only">
          Cari peserta
        </label>
        <Input id="cari" name="cari" defaultValue={cari} placeholder="Cari nama peserta" className="h-10 bg-card pl-9" />
      </form>

      {peserta.length === 0 ? (
        <p className="rounded-[10px] border border-dashed p-8 text-center text-sm text-muted-foreground">
          {cari ? `Tidak ada peserta bernama "${cari}".` : "Belum ada peserta. Tambahkan peserta pertama dengan tombol di atas."}
        </p>
      ) : (
        <GulirSamping className="rounded-[10px] border bg-card">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b">
                {["Peserta", "Kampus", "Mulai", "Hari ini", "Masuk", "Kehadiran", ""].map((h, i) => (
                  // Kolom nama tetap terlihat saat tabel digeser ke samping di HP.
                  <th key={i} className={cn("px-4 py-2.5 font-normal", i === 5 ? "text-right" : "text-left", i === 0 && "sticky left-0 z-10 bg-card shadow-[1px_0_0_var(--border)]")}>
                    <KepalaKolom>{h}</KepalaKolom>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {peserta.map((p) => (
                <tr key={p.id} className={p.aktif ? undefined : "text-muted-foreground"}>
                  <td className="sticky left-0 z-10 bg-card shadow-[1px_0_0_var(--border)] px-4 py-3">
                    <Link href={`/admin/peserta/${p.id}`} className="group flex items-center gap-3">
                      <Inisial nama={p.nama} />
                      <span className="min-w-0">
                        <span className="block font-medium group-hover:text-primary">{p.nama}</span>
                        {/* Di HP email disembunyikan supaya kolom nama yang menempel tidak memakan separuh layar. */}
                        <span className="hidden truncate text-xs text-muted-foreground sm:block">{p.email}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="min-w-44 px-4 py-3">
                    {p.kampus}
                    {p.role && <span className="block text-xs text-muted-foreground">{p.role}</span>}
                  </td>
                  <td className="px-4 whitespace-nowrap tabular-nums">{p.tanggalMulai ? formatTanggalPendek(p.tanggalMulai) : "–"}</td>
                  <td className="px-4">{p.aktif ? <LencanaStatus kode={p.kode} menitTerlambat={p.absensi?.menitTerlambat} /> : <span className="text-xs font-semibold">Nonaktif</span>}</td>
                  <td className="px-4 whitespace-nowrap tabular-nums">{formatJam(p.absensi?.jamMasuk)}</td>
                  <td className="px-4 text-right tabular-nums">{p.rekap.persenKehadiran !== null ? `${p.rekap.persenKehadiran}%` : "–"}</td>
                  <td className="px-4 text-right">
                    <TombolStatusPeserta id={p.id} aktif={p.aktif} nama={p.nama} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GulirSamping>
      )}
    </div>
  );
}
