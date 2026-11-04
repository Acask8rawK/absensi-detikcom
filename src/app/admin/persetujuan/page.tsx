import type { Metadata } from "next";
import Link from "next/link";
import { wajibPeran } from "@/lib/auth";
import { dataPersetujuan } from "@/lib/data";
import { dariDate, formatJam } from "@/lib/waktu";
import { cn } from "@/lib/utils";
import { TombolTinjau } from "@/components/admin/tinjau";
import { Cap } from "@/components/cap";
import { judulPengajuan, ketCap, rentangPengajuan, type PengajuanTampil } from "@/components/kartu-pengajuan";
import { Inisial, TulisanPeserta } from "@/components/rapor";

export const metadata: Metadata = { title: "Persetujuan" };

// Keputusan yang baru diambil beberapa detik lalu menampilkan cap dengan animasi mendarat.
const BARU_MS = 15_000;
const baruDiputuskan = (saat: Date | null) => saat !== null && Date.now() - saat.getTime() < BARU_MS;

function Kartu({
  p,
  nama,
  kampus,
  aksi,
  tercatat,
}: {
  p: PengajuanTampil;
  nama: string;
  kampus: string | null;
  aksi?: React.ReactNode;
  tercatat?: string;
}) {
  const baru = baruDiputuskan(p.ditinjauPada);
  return (
    <article className="flex items-start gap-4 px-4 py-4 sm:px-5">
      <Inisial nama={nama} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-semibold">{nama}</span>
          <span className="text-muted-foreground"> · {kampus}</span>
        </p>
        <p className="mt-0.5 text-sm font-medium">
          {judulPengajuan(p)} <span className="font-normal text-muted-foreground tabular-nums">· {rentangPengajuan(p)}</span>
        </p>
        {tercatat && <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">Tercatat sekarang: {tercatat}</p>}
        <TulisanPeserta className="mt-1.5 block max-w-prose text-sm leading-relaxed">{p.alasan}</TulisanPeserta>
        {p.catatanAdmin && <p className="mt-1.5 text-xs text-muted-foreground">Catatan admin: <span className="text-foreground">{p.catatanAdmin}</span></p>}
        {aksi && <div className="mt-3">{aksi}</div>}
      </div>
      {p.status !== "MENUNGGU" && <Cap jenis={p.status} keterangan={ketCap(p)} mendarat={baru} />}
    </article>
  );
}

export default async function Persetujuan({ searchParams }: PageProps<"/admin/persetujuan">) {
  await wajibPeran("ADMIN");
  const sp = await searchParams;
  const tab = sp.tab === "koreksi" ? "koreksi" : "izin";
  const d = await dataPersetujuan();

  const kunci = (penggunaId: string, tanggal: Date) => `${penggunaId}|${dariDate(tanggal)}`;
  const absensi = new Map(d.absensiTerkait.map((a) => [kunci(a.penggunaId, a.tanggal), a]));

  const menunggu =
    tab === "izin"
      ? d.izinMenunggu.map((p) => ({ ...p, jenisData: "izin" as const }))
      : d.koreksiMenunggu.map((p) => ({ ...p, jenisData: "koreksi" as const }));
  const selesai =
    tab === "izin"
      ? d.izinSelesai.map((p) => ({ ...p, jenisData: "izin" as const }))
      : d.koreksiSelesai.map((p) => ({ ...p, jenisData: "koreksi" as const }));

  return (
    <div className="grid gap-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Persetujuan</h1>
        <p className="mt-1 text-sm text-muted-foreground">Setiap keputusan diberi cap berisi tanggal dan inisial admin yang memutuskan.</p>
      </header>

      <nav className="inline-flex w-fit rounded-lg bg-muted p-[3px] text-sm" aria-label="Jenis pengajuan">
        {(
          [
            ["izin", "Izin / sakit", d.izinMenunggu.length],
            ["koreksi", "Koreksi absensi", d.koreksiMenunggu.length],
          ] as const
        ).map(([id, label, n]) => (
          <Link
            key={id}
            href={`/admin/persetujuan?tab=${id}`}
            aria-current={tab === id ? "page" : undefined}
            className={cn("flex items-center gap-1.5 rounded-md px-3 py-1 font-medium text-muted-foreground", tab === id && "bg-background text-foreground shadow-sm")}
          >
            {label}
            {n > 0 && <span className="rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground tabular-nums">{n}</span>}
          </Link>
        ))}
      </nav>

      <section className="grid gap-2" aria-labelledby="judul-menunggu">
        <h2 id="judul-menunggu" className="font-semibold">
          Menunggu keputusan
        </h2>
        {menunggu.length === 0 ? (
          <p className="rounded-[10px] border border-dashed p-6 text-center text-sm text-muted-foreground">
            Tidak ada yang menunggu. {tab === "izin" ? "Pengajuan izin dan sakit" : "Koreksi absensi"} dari peserta akan muncul di sini.
          </p>
        ) : (
          <div className="divide-y overflow-hidden rounded-[10px] border bg-card">
            {menunggu.map((p) => {
              const a = p.jenisData === "koreksi" ? absensi.get(kunci(p.penggunaId, p.tanggal)) : undefined;
              const tercatat = p.jenisData === "koreksi" ? (a ? `masuk ${formatJam(a.jamMasuk)}, pulang ${formatJam(a.jamPulang)}` : "belum ada absensi") : undefined;
              return <Kartu key={p.id} p={p} nama={p.pengguna.nama} kampus={p.pengguna.kampus} tercatat={tercatat} aksi={<TombolTinjau id={p.id} jenis={tab} />} />;
            })}
          </div>
        )}
      </section>

      <section className="grid gap-2" aria-labelledby="judul-selesai">
        <h2 id="judul-selesai" className="font-semibold">
          Sudah diputuskan
        </h2>
        {selesai.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada keputusan.</p>
        ) : (
          <div className="divide-y overflow-hidden rounded-[10px] border bg-card">
            {selesai.map((p) => (
              <Kartu key={p.id} p={p} nama={p.pengguna.nama} kampus={p.pengguna.kampus} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
