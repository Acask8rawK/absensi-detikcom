import type { Metadata } from "next";
import Link from "next/link";
import { wajibPeran } from "@/lib/auth";
import { dataDashboard } from "@/lib/data";
import { formatJam, formatTanggal, formatTanggalSedang, tanggalWIB } from "@/lib/waktu";
import { GrafikKehadiran } from "@/components/admin/grafik";
import { TombolTinjau } from "@/components/admin/tinjau";
import { KartuPengajuan } from "@/components/kartu-pengajuan";
import { BarisAngka, BlokKetidakhadiran, Inisial, KepalaKolom, TulisanPeserta } from "@/components/rapor";
import { LencanaStatus } from "@/components/status";
import { termasukHadir } from "@/lib/status";

export const metadata: Metadata = { title: "Dashboard" };

function Panel({ judul, keterangan, children, className }: { judul: string; keterangan?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-[10px] border bg-card p-4 sm:p-5 ${className ?? ""}`}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-semibold">{judul}</h2>
        {keterangan && <span className="text-xs text-muted-foreground">{keterangan}</span>}
      </div>
      {children}
    </section>
  );
}

const namaDepan = (nama: string) => nama.split(" ")[0];

export default async function DashboardAdmin() {
  await wajibPeran("ADMIN");
  const sekarang = new Date();
  const hariIni = tanggalWIB(sekarang);
  const d = await dataDashboard(hariIni);

  const hadir = d.hariIniPeserta.filter((p) => termasukHadir(p.kode));
  const telat = hadir.filter((p) => p.absensi?.statusMasuk === "TERLAMBAT");
  const izin = d.hariIniPeserta.filter((p) => p.kode === "IZIN" || p.kode === "SAKIT");
  const belum = d.hariIniPeserta.filter((p) => p.kode === "BELUM_ABSEN" || p.kode === "ALPA");
  const antrean = [
    ...d.izinMenunggu.map((p) => ({ ...p, jenisData: "izin" as const })),
    ...d.koreksiMenunggu.map((p) => ({ ...p, jenisData: "koreksi" as const })),
  ];

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm text-muted-foreground tabular-nums">
            {formatTanggal(hariIni)} · {formatJam(sekarang)} WIB
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <Link href="/admin/laporan" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Buka laporan lengkap
        </Link>
      </header>

      <BarisAngka
        isi={[
          { label: "Hadir", nilai: <>{hadir.length}<span className="text-lg text-muted-foreground"> / {d.jumlahPeserta}</span></>, catatan: `${hadir.length - telat.length} tepat waktu` },
          { label: "Terlambat", nilai: telat.length, catatan: telat.map((p) => namaDepan(p.nama)).join(", ") || "Tidak ada" },
          { label: "Sakit / izin", nilai: izin.length, catatan: izin.map((p) => namaDepan(p.nama)).join(", ") || "Tidak ada" },
          { label: "Belum absen", nilai: belum.length, catatan: belum.map((p) => namaDepan(p.nama)).join(", ") || "Semua sudah absen" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Panel judul="Kehadiran 10 hari kerja" keterangan={`skala 0–${d.jumlahPeserta} peserta`}>
          <GrafikKehadiran
            jumlahPeserta={d.jumlahPeserta}
            data={d.grafik.map((g) => ({ label: formatTanggalSedang(g.tanggal).replace(/^\w+, /, ""), tepat: g.tepat, telat: g.telat, izinSakit: g.izinSakit, alpa: g.alpa }))}
          />
        </Panel>
        <Panel judul="Ketidakhadiran" keterangan="bulan ini, semua peserta">
          <BlokKetidakhadiran sakit={d.total.sakit} izin={d.total.izin} alpa={d.total.alpa} tidakCheckout={d.total.tidakCheckout} />
          <p className="mt-3 text-sm text-muted-foreground tabular-nums">
            Tingkat kehadiran {d.total.hariKerja ? Math.round((d.total.hadir / d.total.hariKerja) * 100) : 0}% dari {d.total.hariKerja} hari-orang kerja.
          </p>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Panel judul="Peserta hari ini" keterangan={<Link href="/admin/peserta" className="text-primary hover:underline">Lihat semua</Link>}>
          <div className="-mx-4 overflow-x-auto sm:-mx-5">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b">
                  {["Nama", "Masuk", "Pulang", "Status", "Logbook terakhir"].map((h) => (
                    <th key={h} className="px-4 pb-2 text-left font-normal sm:first:pl-5">
                      <KepalaKolom>{h}</KepalaKolom>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {d.hariIniPeserta.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2.5 sm:pl-5">
                      <Link href={`/admin/peserta/${p.id}`} className="flex items-center gap-2.5 font-medium hover:text-primary">
                        <Inisial nama={p.nama} className="size-7" />
                        {p.nama}
                      </Link>
                    </td>
                    <td className="px-4 tabular-nums">{formatJam(p.absensi?.jamMasuk)}</td>
                    <td className="px-4 tabular-nums">{formatJam(p.absensi?.jamPulang)}</td>
                    <td className="px-4">
                      <LencanaStatus kode={p.kode} menitTerlambat={p.absensi?.menitTerlambat} />
                    </td>
                    <td className="max-w-60 px-4 py-2.5">
                      {p.logbookTerakhir ? <TulisanPeserta className="line-clamp-2 text-sm">{p.logbookTerakhir}</TulisanPeserta> : <span className="text-muted-foreground">–</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel judul="Menunggu persetujuan" keterangan={antrean.length ? `${antrean.length} pengajuan` : undefined}>
          {antrean.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada pengajuan yang menunggu. Pengajuan izin dan koreksi dari peserta akan muncul di sini.</p>
          ) : (
            <div className="-mx-4 divide-y sm:-mx-5">
              {antrean.slice(0, 4).map((p) => (
                <KartuPengajuan key={p.id} p={p} nama={p.pengguna.nama} aksi={<TombolTinjau id={p.id} jenis={p.jenisData} />} />
              ))}
              {antrean.length > 4 && (
                <Link href="/admin/persetujuan" className="block px-5 pt-3 text-sm font-medium text-primary hover:underline">
                  Lihat {antrean.length - 4} lainnya
                </Link>
              )}
            </div>
          )}
        </Panel>
      </div>

      <p className="text-xs text-muted-foreground">Semua data di aplikasi ini adalah data contoh.</p>
    </div>
  );
}
