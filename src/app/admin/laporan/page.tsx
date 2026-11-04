import type { Metadata } from "next";
import Link from "next/link";
import { DownloadIcon } from "lucide-react";
import { wajibPeran } from "@/lib/auth";
import { dataLaporan } from "@/lib/data";
import { bacaPeriode, PERIODE } from "@/lib/periode";
import { formatDurasi, formatMenitHari, formatTanggalPendek, tanggalWIB } from "@/lib/waktu";
import { cn } from "@/lib/utils";
import { GulirSamping } from "@/components/gulir-samping";
import { InputTanggal } from "@/components/input-waktu";
import { Inisial, KepalaKolom } from "@/components/rapor";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "Laporan" };

const KOLOM = [
  ["Hari kerja", "hariKerja"],
  ["Hadir", "hadir"],
  ["Tepat", "tepatWaktu"],
  ["Telat", "terlambat"],
  ["Izin", "izin"],
  ["Sakit", "sakit"],
  ["Alpa", "alpa"],
  ["Tdk check-out", "tidakCheckout"],
] as const;

export default async function Laporan({ searchParams }: PageProps<"/admin/laporan">) {
  await wajibPeran("ADMIN");
  const sp = await searchParams;
  const hariIni = tanggalWIB();
  const periode = bacaPeriode(sp, hariIni);
  const cari = typeof sp.cari === "string" ? sp.cari.trim().slice(0, 60) : "";
  const baris = await dataLaporan(periode.dari, periode.sampai, cari, hariIni);
  const kueri = new URLSearchParams({ dari: periode.dari, sampai: periode.sampai, ...(cari ? { cari } : {}) });

  return (
    <div className="grid gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Laporan</h1>
          <p className="mt-1 text-sm text-muted-foreground tabular-nums">
            {formatTanggalPendek(periode.dari)} – {formatTanggalPendek(periode.sampai)} · {baris.length} peserta
          </p>
        </div>
        <a href={`/api/laporan/csv?${kueri}`} className={buttonVariants({ className: "h-9" })}>
          <DownloadIcon /> Unduh CSV
        </a>
      </header>

      <div className="flex flex-wrap items-end gap-3 rounded-[10px] border bg-card p-3">
        <nav className="inline-flex rounded-lg bg-muted p-[3px] text-sm" aria-label="Periode cepat">
          {PERIODE.map((p) => (
            <Link
              key={p.id}
              href={`/admin/laporan?periode=${p.id}${cari ? `&cari=${encodeURIComponent(cari)}` : ""}`}
              aria-current={periode.id === p.id ? "page" : undefined}
              className={cn("rounded-md px-3 py-1 font-medium text-muted-foreground", periode.id === p.id && "bg-background text-foreground shadow-sm")}
            >
              {p.label}
            </Link>
          ))}
        </nav>
        {/* Di HP: Dari dan Sampai berdampingan, lalu Nama dan tombol Terapkan. */}
        <form className="grid w-full grid-cols-2 items-end gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <label className="grid min-w-0 gap-1 text-xs font-medium sm:w-40">
            Dari
            <InputTanggal name="dari" defaultValue={periode.dari} max={hariIni} className="h-9" />
          </label>
          <label className="grid min-w-0 gap-1 text-xs font-medium sm:w-40">
            Sampai
            <InputTanggal name="sampai" defaultValue={periode.sampai} max={hariIni} className="h-9" />
          </label>
          <label className="grid min-w-0 gap-1 text-xs font-medium sm:w-40">
            Nama
            <Input name="cari" defaultValue={cari} placeholder="Semua peserta" className="h-9" />
          </label>
          <button type="submit" className={buttonVariants({ variant: "outline", className: "h-9" })}>
            Terapkan
          </button>
        </form>
      </div>

      {baris.length === 0 ? (
        <p className="rounded-[10px] border border-dashed p-8 text-center text-sm text-muted-foreground">Tidak ada peserta yang cocok dengan filter ini.</p>
      ) : (
        <GulirSamping className="rounded-[10px] border bg-card">
          <table className="w-full min-w-[940px] border-collapse text-sm">
            <thead>
              <tr className="border-b">
                {/* Kolom nama menempel di kiri saat tabel digeser di layar sempit. */}
                <th className="sticky left-0 z-10 bg-card px-4 py-2.5 text-left font-normal">
                  <KepalaKolom>Peserta</KepalaKolom>
                </th>
                {KOLOM.map(([label]) => (
                  <th key={label} className="border-l px-3 py-2.5 text-right font-normal">
                    <KepalaKolom>{label}</KepalaKolom>
                  </th>
                ))}
                <th className="border-l px-3 py-2.5 text-right font-normal">
                  <KepalaKolom>Rata masuk</KepalaKolom>
                </th>
                <th className="border-l px-3 py-2.5 text-right font-normal">
                  <KepalaKolom>Total kerja</KepalaKolom>
                </th>
                <th className="border-l px-4 py-2.5 text-right font-normal">
                  <KepalaKolom>Kehadiran</KepalaKolom>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {baris.map((b) => (
                <tr key={b.id}>
                  <td className="sticky left-0 z-10 bg-card px-4 py-2.5">
                    <Link href={`/admin/peserta/${b.id}`} className="flex items-center gap-2.5 font-medium hover:text-primary">
                      <Inisial nama={b.nama} className="size-7" />
                      <span>
                        {b.nama}
                        {!b.aktif && <span className="ml-1.5 text-xs font-normal text-muted-foreground">nonaktif</span>}
                      </span>
                    </Link>
                  </td>
                  {KOLOM.map(([label, kunci]) => {
                    const nilai = b.rekap[kunci];
                    const peringatan = (kunci === "alpa" || kunci === "tidakCheckout") && nilai > 0;
                    return (
                      <td key={label} className={cn("border-l px-3 text-right tabular-nums", nilai === 0 && "text-muted-foreground", peringatan && "font-semibold text-st-alpa")}>
                        {nilai}
                      </td>
                    );
                  })}
                  <td className="border-l px-3 text-right whitespace-nowrap tabular-nums">{b.rekap.rataJamMasuk !== null ? formatMenitHari(b.rekap.rataJamMasuk) : "–"}</td>
                  <td className="border-l px-3 text-right whitespace-nowrap tabular-nums">{formatDurasi(b.rekap.totalMenitKerja)}</td>
                  <td className="border-l px-4 text-right font-semibold tabular-nums">{b.rekap.persenKehadiran !== null ? `${b.rekap.persenKehadiran}%` : "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GulirSamping>
      )}
      <p className="text-xs text-muted-foreground">
        Kehadiran = hari hadir ÷ hari kerja. Hari kerja dihitung Senin–Jumat sejak tanggal mulai magang; izin dan sakit tetap dihitung sebagai hari kerja. File CSV memakai
        pemisah titik koma supaya langsung rapi di Excel berbahasa Indonesia.
      </p>
    </div>
  );
}
