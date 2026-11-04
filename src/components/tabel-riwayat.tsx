import Link from "next/link";
import { BATAS_KOREKSI_HARI } from "@/lib/konfigurasi";
import type { KodeStatus } from "@/lib/status";
import { durasiMenit, formatJam, formatTanggalSedang, selisihHari, type Tanggal } from "@/lib/waktu";
import { CapKecil } from "./cap";
import { BarDurasi, KepalaKolom, TulisanPeserta } from "./rapor";
import { LencanaStatus } from "./status";

export type BarisRiwayat = {
  tanggal: Tanggal;
  status: KodeStatus;
  absensi: { jamMasuk: Date; jamPulang: Date | null; menitTerlambat: number; logbook: string | null; dikoreksi: boolean } | null;
  koreksi: string | null; // status pengajuan koreksi terakhir di tanggal ini
};

/**
 * Riwayat absensi sebagai tabel bergaris. Dipakai peserta (dengan tautan koreksi)
 * dan admin (tanpa tautan). Di layar sempit, kolom jam dan durasi dilipat ke bawah tanggal.
 */
export function TabelRiwayat({ baris, hariIni, bisaKoreksi = false }: { baris: BarisRiwayat[]; hariIni: Tanggal; bisaKoreksi?: boolean }) {
  if (baris.length === 0) {
    return <p className="rounded-[10px] border border-dashed p-6 text-center text-sm text-muted-foreground">Belum ada absensi di bulan ini.</p>;
  }
  return (
    <div className="overflow-hidden rounded-[10px] border bg-card">
      <div className="hidden grid-cols-[1.2fr_0.8fr_0.8fr_1fr_1.3fr] gap-3 border-b px-4 py-2.5 sm:grid">
        <KepalaKolom>Tanggal</KepalaKolom>
        <KepalaKolom>Masuk</KepalaKolom>
        <KepalaKolom>Pulang</KepalaKolom>
        <KepalaKolom className="text-right">Durasi</KepalaKolom>
        <KepalaKolom>Status</KepalaKolom>
      </div>
      <ul className="divide-y">
        {baris.map((b) => {
          const a = b.absensi;
          const perluKoreksi =
            bisaKoreksi &&
            (b.status === "TIDAK_CHECKOUT" || b.status === "ALPA") &&
            selisihHari(b.tanggal, hariIni) <= BATAS_KOREKSI_HARI &&
            b.koreksi !== "MENUNGGU";
          return (
            <li key={b.tanggal} className="px-4 py-3">
              <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 sm:grid-cols-[1.2fr_0.8fr_0.8fr_1fr_1.3fr]">
                <span className="font-medium tabular-nums">{formatTanggalSedang(b.tanggal)}</span>
                <span className="text-sm tabular-nums text-muted-foreground sm:text-foreground">
                  <span className="sm:hidden">
                    {formatJam(a?.jamMasuk)} – {formatJam(a?.jamPulang)}
                  </span>
                  <span className="hidden sm:inline">{formatJam(a?.jamMasuk)}</span>
                </span>
                <span className="hidden text-sm tabular-nums sm:block">{formatJam(a?.jamPulang)}</span>
                <span className="hidden text-right text-sm sm:block">
                  {a?.jamPulang ? <BarDurasi menit={durasiMenit(a.jamMasuk, a.jamPulang)} /> : <span className="text-muted-foreground">–</span>}
                </span>
                <span className="col-span-2 flex flex-wrap items-center gap-2 sm:col-span-1">
                  <LencanaStatus kode={b.status} menitTerlambat={a?.menitTerlambat} />
                  {a?.dikoreksi && <CapKecil jenis="DIKOREKSI" />}
                  {b.koreksi === "MENUNGGU" && <span className="text-xs text-muted-foreground">Koreksi menunggu</span>}
                </span>
              </div>
              {(a?.logbook || perluKoreksi) && (
                <div className="mt-1.5 flex flex-wrap items-start justify-between gap-2 text-sm">
                  {a?.logbook ? <TulisanPeserta className="max-w-prose leading-relaxed">{a.logbook}</TulisanPeserta> : <span />}
                  {perluKoreksi && (
                    <Link
                      href={`/peserta/pengajuan?tab=koreksi&tanggal=${b.tanggal}`}
                      className="shrink-0 text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Ajukan koreksi
                    </Link>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
