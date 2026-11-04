import { Cap } from "./cap";
import { inisialDari, TulisanPeserta } from "./rapor";
import { dariDate, formatJam, formatTanggalPendek, formatTanggalSedang, hariKerja, rentangTanggal } from "@/lib/waktu";

// Satu pengajuan (izin atau koreksi) seperti yang dilihat peserta dan admin.
// Setelah diputuskan, kartu membawa cap: siapa memutuskan dan kapan.

export type PengajuanTampil =
  | {
      jenisData: "izin";
      id: string;
      jenis: "IZIN" | "SAKIT";
      tanggalMulai: Date;
      tanggalSelesai: Date;
      alasan: string;
      status: "MENUNGGU" | "DISETUJUI" | "DITOLAK";
      catatanAdmin: string | null;
      ditinjauPada: Date | null;
      ditinjauOleh?: { nama: string } | null;
    }
  | {
      jenisData: "koreksi";
      id: string;
      tanggal: Date;
      jamMasukUsulan: Date | null;
      jamPulangUsulan: Date | null;
      alasan: string;
      status: "MENUNGGU" | "DISETUJUI" | "DITOLAK";
      catatanAdmin: string | null;
      ditinjauPada: Date | null;
      ditinjauOleh?: { nama: string } | null;
    };

export function judulPengajuan(p: PengajuanTampil) {
  if (p.jenisData === "koreksi") return "Koreksi absensi";
  return p.jenis === "SAKIT" ? "Sakit" : "Izin";
}

export function rentangPengajuan(p: PengajuanTampil) {
  if (p.jenisData === "koreksi") {
    const jam = [p.jamMasukUsulan && `masuk ${formatJam(p.jamMasukUsulan)}`, p.jamPulangUsulan && `pulang ${formatJam(p.jamPulangUsulan)}`].filter(Boolean).join(", ");
    return `${formatTanggalSedang(dariDate(p.tanggal))} · ${jam}`;
  }
  const mulai = dariDate(p.tanggalMulai);
  const selesai = dariDate(p.tanggalSelesai);
  // Yang ditampilkan jumlah hari kerja, sama dengan yang dihitung di laporan.
  const hari = rentangTanggal(mulai, selesai).filter(hariKerja).length;
  return mulai === selesai ? `${formatTanggalSedang(mulai)} · 1 hari` : `${formatTanggalPendek(mulai)} – ${formatTanggalPendek(selesai)} · ${hari} hari kerja`;
}

export function ketCap(p: PengajuanTampil) {
  if (!p.ditinjauPada) return undefined;
  const t = dariDate(new Date(p.ditinjauPada.getTime() + 7 * 3600_000));
  return `${t.slice(8, 10)}.${t.slice(5, 7)} · ${inisialDari(p.ditinjauOleh?.nama ?? "Admin")}`;
}

export function KartuPengajuan({ p, aksi, nama }: { p: PengajuanTampil; aksi?: React.ReactNode; nama?: string }) {
  return (
    <article className="flex items-start justify-between gap-4 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          {nama && <span className="font-semibold">{nama} · </span>}
          <span className={nama ? "" : "font-semibold"}>{judulPengajuan(p)}</span>
        </p>
        <p className="text-xs text-muted-foreground tabular-nums">{rentangPengajuan(p)}</p>
        <TulisanPeserta className="mt-1 block text-sm leading-relaxed">{p.alasan}</TulisanPeserta>
        {p.status === "MENUNGGU" && <p className="mt-1 text-xs font-medium text-st-telat">Menunggu keputusan admin</p>}
        {p.catatanAdmin && (
          <p className="mt-1 text-xs text-muted-foreground">
            Catatan admin: <span className="text-foreground">{p.catatanAdmin}</span>
          </p>
        )}
        {aksi && <div className="mt-2">{aksi}</div>}
      </div>
      {p.status !== "MENUNGGU" && <Cap jenis={p.status} keterangan={ketCap(p)} className="mt-1" />}
    </article>
  );
}
