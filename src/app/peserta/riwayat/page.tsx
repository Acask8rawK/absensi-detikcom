import type { Metadata } from "next";
import Link from "next/link";
import { wajibPeran } from "@/lib/auth";
import { dataRiwayatPeserta } from "@/lib/data";
import { formatDurasi, tanggalWIB } from "@/lib/waktu";
import { cn } from "@/lib/utils";
import { KalenderKehadiran } from "@/components/kalender";
import { NavigasiBulan, bacaBulan } from "@/components/navigasi-bulan";
import { BlokKetidakhadiran } from "@/components/rapor";
import { TabelRiwayat } from "@/components/tabel-riwayat";

export const metadata: Metadata = { title: "Riwayat" };

export default async function RiwayatPeserta({ searchParams }: PageProps<"/peserta/riwayat">) {
  const peserta = await wajibPeran("PESERTA");
  const sp = await searchParams;
  const hariIni = tanggalWIB();
  const bulan = bacaBulan(sp.bulan, hariIni);
  const tampilan = sp.tampil === "kalender" ? "kalender" : "daftar";
  const data = await dataRiwayatPeserta(peserta.id, bulan, hariIni);
  const href = (b: string, t = tampilan) => `/peserta/riwayat?bulan=${b}${t === "kalender" ? "&tampil=kalender" : ""}`;

  return (
    <div className="grid gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Riwayat</h1>
        <NavigasiBulan bulan={bulan} hariIni={hariIni} buatHref={(b) => href(b)} />
      </header>

      <div className="inline-flex w-fit rounded-lg bg-muted p-[3px] text-sm" role="tablist" aria-label="Tampilan riwayat">
        {(["daftar", "kalender"] as const).map((t) => (
          <Link
            key={t}
            href={href(bulan.slice(0, 7), t)}
            role="tab"
            aria-selected={tampilan === t}
            className={cn("rounded-md px-3 py-1 font-medium text-muted-foreground", tampilan === t && "bg-background text-foreground shadow-sm")}
          >
            {t === "daftar" ? "Daftar" : "Kalender"}
          </Link>
        ))}
      </div>

      <dl className="grid grid-cols-2 overflow-hidden rounded-[10px] border bg-card text-center">
        <div className="px-2 py-3">
          <dt className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Kehadiran</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums">{data.rekap.persenKehadiran ?? "–"}{data.rekap.persenKehadiran !== null && "%"}</dd>
        </div>
        <div className="border-l px-2 py-3">
          <dt className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Total kerja</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums">{formatDurasi(data.rekap.totalMenitKerja)}</dd>
        </div>
      </dl>

      {tampilan === "kalender" ? (
        <div className="grid gap-4">
          <div className="rounded-[10px] border bg-card p-4">
            <KalenderKehadiran bulan={bulan} status={data.kalender} terlambat={data.terlambat} hariIni={hariIni} />
          </div>
          <BlokKetidakhadiran sakit={data.rekap.sakit} izin={data.rekap.izin} alpa={data.rekap.alpa} tidakCheckout={data.rekap.tidakCheckout} className="bg-card" />
        </div>
      ) : (
        <TabelRiwayat baris={data.baris} hariIni={hariIni} bisaKoreksi />
      )}
      <p className="text-xs text-muted-foreground">
        Lupa check-out atau check-in? Pilih &ldquo;Ajukan koreksi&rdquo; di baris tanggalnya, paling lama 7 hari ke belakang.
      </p>
    </div>
  );
}
