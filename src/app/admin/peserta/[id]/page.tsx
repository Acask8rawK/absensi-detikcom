import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { wajibPeran } from "@/lib/auth";
import { dataDetailPeserta } from "@/lib/data";
import { dariDate, formatDurasi, formatMenitHari, formatTanggal, tanggalWIB } from "@/lib/waktu";
import { KalenderKehadiran } from "@/components/kalender";
import { NavigasiBulan, bacaBulan } from "@/components/navigasi-bulan";
import { BlokKetidakhadiran, Inisial, KepalaKolom } from "@/components/rapor";
import { TabelRiwayat } from "@/components/tabel-riwayat";

export const metadata: Metadata = { title: "Detail peserta" };

export default async function DetailPeserta({ params, searchParams }: PageProps<"/admin/peserta/[id]">) {
  await wajibPeran("ADMIN");
  const { id } = await params;
  const sp = await searchParams;
  const hariIni = tanggalWIB();
  const bulan = bacaBulan(sp.bulan, hariIni);
  const data = await dataDetailPeserta(id, bulan, hariIni);
  if (!data) notFound();
  const { pengguna: p, rekap } = data;

  return (
    <div className="grid gap-6">
      <Link href="/admin/peserta" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" /> Semua peserta
      </Link>

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Inisial nama={p.nama} className="size-12 text-base" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{p.nama}</h1>
            <p className="text-sm text-muted-foreground">
              {[p.kampus, p.role, p.tanggalMulai && `mulai ${formatTanggal(dariDate(p.tanggalMulai))}`].filter(Boolean).join(" · ")}
              {!p.aktif && " · nonaktif"}
            </p>
          </div>
        </div>
        <NavigasiBulan bulan={bulan} hariIni={hariIni} buatHref={(b) => `/admin/peserta/${p.id}?bulan=${b}`} />
      </header>

      <dl className="grid grid-cols-2 overflow-hidden rounded-[10px] border bg-card md:grid-cols-4">
        {[
          ["Kehadiran", rekap.persenKehadiran !== null ? `${rekap.persenKehadiran}%` : "–"],
          ["Hadir", `${rekap.hadir} / ${rekap.hariKerja} hari`],
          ["Rata-rata masuk", rekap.rataJamMasuk !== null ? formatMenitHari(rekap.rataJamMasuk) : "–"],
          ["Total kerja", formatDurasi(rekap.totalMenitKerja)],
        ].map(([k, v], i) => (
          <div key={k} className={`px-4 py-3 ${i % 2 ? "border-l" : ""} ${i >= 2 ? "border-t md:border-t-0" : ""} ${i > 0 ? "md:border-l" : ""}`}>
            <dt>
              <KepalaKolom>{k}</KepalaKolom>
            </dt>
            <dd className="mt-1 text-xl font-bold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <section className="rounded-[10px] border bg-card p-4 sm:p-5">
          <h2 className="mb-3 font-semibold">Kalender</h2>
          <KalenderKehadiran bulan={bulan} status={data.kalender} terlambat={data.terlambat} hariIni={hariIni} />
        </section>
        <section className="rounded-[10px] border bg-card p-4 sm:p-5">
          <h2 className="mb-3 font-semibold">Ketidakhadiran</h2>
          <BlokKetidakhadiran sakit={rekap.sakit} izin={rekap.izin} alpa={rekap.alpa} tidakCheckout={rekap.tidakCheckout} />
          <p className="mt-3 text-sm text-muted-foreground tabular-nums">
            Terlambat {rekap.terlambat} kali dari {rekap.hadir} hari hadir.
          </p>
        </section>
      </div>

      <section className="grid gap-3">
        <h2 className="font-semibold">Riwayat & logbook</h2>
        <TabelRiwayat baris={data.baris} hariIni={hariIni} />
      </section>
    </div>
  );
}
