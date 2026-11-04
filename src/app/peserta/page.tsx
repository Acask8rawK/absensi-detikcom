import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { wajibPeran } from "@/lib/auth";
import { dataBerandaPeserta } from "@/lib/data";
import { awalBulan, formatBulan, formatTanggal, hariKerja, tanggalWIB } from "@/lib/waktu";
import { KalenderKehadiran } from "@/components/kalender";
import { NotifikasiDariUrl } from "@/components/notifikasi-url";
import { BlokKetidakhadiran, KepalaKolom } from "@/components/rapor";
import { KartuHariIni } from "@/components/peserta/kartu-hari-ini";

export const metadata: Metadata = { title: "Beranda" };

export default async function BerandaPeserta() {
  const peserta = await wajibPeran("PESERTA");
  const sekarang = new Date();
  const hariIni = tanggalWIB(sekarang);
  const data = await dataBerandaPeserta(peserta.id, hariIni);
  const a = data.absensiHariIni;

  return (
    <div className="grid gap-6">
      <Suspense>
        <NotifikasiDariUrl />
      </Suspense>
      <header>
        <p className="text-sm text-muted-foreground">{formatTanggal(hariIni)}</p>
        <h1 className="text-2xl font-bold tracking-tight">Halo, {peserta.nama.split(" ")[0]}</h1>
      </header>

      <KartuHariIni
        waktuServer={sekarang.getTime()}
        hariKerja={hariKerja(hariIni)}
        status={data.statusHariIni}
        absensi={
          a && {
            jamMasuk: a.jamMasuk.toISOString(),
            jamPulang: a.jamPulang?.toISOString() ?? null,
            statusMasuk: a.statusMasuk,
            menitTerlambat: a.menitTerlambat,
            logbook: a.logbook,
          }
        }
      />

      <section className="grid gap-3" aria-labelledby="judul-bulan">
        <div className="flex items-baseline justify-between">
          <h2 id="judul-bulan" className="font-semibold">
            {formatBulan(hariIni)}
          </h2>
          <p className="text-sm text-muted-foreground tabular-nums">
            {/* Peserta baru belum punya hari kerja yang dihitung; "0 dari 0" tidak berarti apa-apa. */}
            {data.rekap.hariKerja === 0
              ? "Rekap mulai dihitung setelah hari kerja pertamamu"
              : `Hadir ${data.rekap.hadir} dari ${data.rekap.hariKerja} hari kerja`}
            {data.rekap.persenKehadiran !== null && ` · ${data.rekap.persenKehadiran}%`}
          </p>
        </div>
        <div className="rounded-[10px] border bg-card p-4">
          <KepalaKolom>Ketidakhadiran</KepalaKolom>
          <BlokKetidakhadiran className="mt-2" sakit={data.rekap.sakit} izin={data.rekap.izin} alpa={data.rekap.alpa} tidakCheckout={data.rekap.tidakCheckout} />
          {data.menunggu > 0 && (
            <p className="mt-3 text-sm">
              {data.menunggu} pengajuan menunggu keputusan admin.{" "}
              <Link href="/peserta/pengajuan" className="font-medium text-primary underline-offset-4 hover:underline">
                Lihat pengajuan
              </Link>
            </p>
          )}
        </div>
        <div className="rounded-[10px] border bg-card p-4">
          <KalenderKehadiran bulan={awalBulan(hariIni)} status={data.kalender} terlambat={data.terlambat} hariIni={hariIni} />
        </div>
      </section>
    </div>
  );
}
