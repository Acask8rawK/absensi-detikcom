import type { Metadata } from "next";
import Link from "next/link";
import { wajibPeran } from "@/lib/auth";
import { dataPengajuanPeserta } from "@/lib/data";
import { BATAS_KOREKSI_HARI } from "@/lib/konfigurasi";
import { tambahHari, tanggalWIB } from "@/lib/waktu";
import { cn } from "@/lib/utils";
import { KartuPengajuan } from "@/components/kartu-pengajuan";
import { FormIzin, FormKoreksi, TombolBatal } from "@/components/peserta/form-pengajuan";

export const metadata: Metadata = { title: "Pengajuan" };

export default async function PengajuanPeserta({ searchParams }: PageProps<"/peserta/pengajuan">) {
  const peserta = await wajibPeran("PESERTA");
  const sp = await searchParams;
  const tab = sp.tab === "koreksi" ? "koreksi" : "izin";
  const hariIni = tanggalWIB();
  const kemarin = tambahHari(hariIni, -1);
  const batasMundur = tambahHari(hariIni, -BATAS_KOREKSI_HARI);
  const tanggalAwal = typeof sp.tanggal === "string" && sp.tanggal >= batasMundur && sp.tanggal <= kemarin ? sp.tanggal : kemarin;
  const { izin, koreksi } = await dataPengajuanPeserta(peserta.id);

  const daftar =
    tab === "izin"
      ? izin.map((p) => ({ ...p, jenisData: "izin" as const }))
      : koreksi.map((p) => ({ ...p, jenisData: "koreksi" as const }));

  return (
    <div className="grid gap-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Pengajuan</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ajukan izin, sakit, atau koreksi absensi. Admin akan menyetujui atau menolak dengan alasan.</p>
      </header>

      <div className="inline-flex w-fit rounded-lg bg-muted p-[3px] text-sm" role="tablist" aria-label="Jenis pengajuan">
        {(["izin", "koreksi"] as const).map((t) => (
          <Link
            key={t}
            href={`/peserta/pengajuan?tab=${t}`}
            role="tab"
            aria-selected={tab === t}
            className={cn("rounded-md px-3 py-1 font-medium text-muted-foreground", tab === t && "bg-background text-foreground shadow-sm")}
          >
            {t === "izin" ? "Izin / sakit" : "Koreksi absensi"}
          </Link>
        ))}
      </div>

      <section className="rounded-[10px] border bg-card p-5">
        {tab === "izin" ? (
          <FormIzin hariIni={hariIni} batasMundur={batasMundur} />
        ) : (
          <FormKoreksi tanggalAwal={tanggalAwal} batasMundur={batasMundur} kemarin={kemarin} />
        )}
      </section>

      <section aria-labelledby="judul-daftar" className="grid gap-2">
        <h2 id="judul-daftar" className="font-semibold">
          {tab === "izin" ? "Pengajuan izin & sakit" : "Pengajuan koreksi"}
        </h2>
        {daftar.length === 0 ? (
          <p className="rounded-[10px] border border-dashed p-6 text-center text-sm text-muted-foreground">
            {tab === "izin"
              ? "Belum ada pengajuan. Kalau berhalangan hadir, ajukan izin lewat form di atas."
              : "Belum ada koreksi. Kalau lupa check-out, ajukan jam pulang yang benar lewat form di atas."}
          </p>
        ) : (
          <div className="divide-y overflow-hidden rounded-[10px] border bg-card">
            {daftar.map((p) => (
              <KartuPengajuan key={p.id} p={p} aksi={p.status === "MENUNGGU" ? <TombolBatal id={p.id} jenis={tab} /> : undefined} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
