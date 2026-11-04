import { statusHarian, termasukHadir, termasukHariKerjaDihitung, type KodeStatus } from "./status";
import { dariDate, durasiMenit, hariKerja, menitDalamHariWIB, rentangTanggal, type Tanggal } from "./waktu";

// Rekap kehadiran (flowchart FC-7). Data mentah diambil sekali dari database,
// lalu setiap tanggal dinilai dengan statusHarian(). Alpa tidak pernah disimpan;
// ia muncul di sini sebagai "hari kerja tanpa data".

export type AbsensiMentah = {
  tanggal: Date;
  jamMasuk: Date;
  jamPulang: Date | null;
  statusMasuk: "TEPAT_WAKTU" | "TERLAMBAT" | "HARI_LIBUR";
  menitTerlambat: number;
  logbook: string | null;
  dikoreksi: boolean;
};

export type IzinMentah = {
  jenis: "IZIN" | "SAKIT";
  tanggalMulai: Date;
  tanggalSelesai: Date;
};

export type PesertaMentah = {
  tanggalMulai: Date | null;
  tanggalSelesai: Date | null;
  absensi: AbsensiMentah[];
  izin: IzinMentah[]; // hanya yang disetujui
};

export type Rekap = {
  hariKerja: number;
  hadir: number;
  tepatWaktu: number;
  terlambat: number;
  izin: number;
  sakit: number;
  alpa: number;
  tidakCheckout: number;
  rataJamMasuk: number | null; // menit sejak tengah malam WIB
  totalMenitKerja: number;
  persenKehadiran: number | null;
};

/** Peta tanggal → jenis izin, untuk izin yang sudah disetujui. */
export function petaIzin(izin: IzinMentah[]) {
  const peta = new Map<Tanggal, "IZIN" | "SAKIT">();
  for (const i of izin) {
    for (const t of rentangTanggal(dariDate(i.tanggalMulai), dariDate(i.tanggalSelesai))) peta.set(t, i.jenis);
  }
  return peta;
}

export function petaAbsensi(absensi: AbsensiMentah[]) {
  return new Map(absensi.map((a) => [dariDate(a.tanggal), a]));
}

/** Status per tanggal untuk kalender dan riwayat. */
export function statusPerTanggal(p: PesertaMentah, tanggal: Tanggal[], hariIni: Tanggal) {
  const abs = petaAbsensi(p.absensi);
  const izn = petaIzin(p.izin);
  const mulai = p.tanggalMulai ? dariDate(p.tanggalMulai) : null;
  const selesai = p.tanggalSelesai ? dariDate(p.tanggalSelesai) : null;
  return new Map<Tanggal, KodeStatus>(
    tanggal.map((t) => [t, statusHarian({ tanggal: t, hariIni, absensi: abs.get(t), izin: izn.get(t), mulai, selesai })]),
  );
}

export function hitungRekap(p: PesertaMentah, dari: Tanggal, sampai: Tanggal, hariIni: Tanggal): Rekap {
  const tanggal = rentangTanggal(dari, sampai);
  const status = statusPerTanggal(p, tanggal, hariIni);
  const abs = petaAbsensi(p.absensi);

  const r: Rekap = {
    hariKerja: 0, hadir: 0, tepatWaktu: 0, terlambat: 0, izin: 0, sakit: 0, alpa: 0,
    tidakCheckout: 0, rataJamMasuk: null, totalMenitKerja: 0, persenKehadiran: null,
  };
  const jamMasukHariKerja: number[] = [];

  for (const t of tanggal) {
    const kode = status.get(t)!;
    const a = abs.get(t);
    if (termasukHariKerjaDihitung(kode) && hariKerja(t)) r.hariKerja++;
    if (termasukHadir(kode) && hariKerja(t)) {
      r.hadir++;
      if (a?.statusMasuk === "TERLAMBAT") r.terlambat++;
      else r.tepatWaktu++;
      jamMasukHariKerja.push(menitDalamHariWIB(a!.jamMasuk));
    }
    if (kode === "IZIN") r.izin++;
    if (kode === "SAKIT") r.sakit++;
    if (kode === "ALPA") r.alpa++;
    if (kode === "TIDAK_CHECKOUT") r.tidakCheckout++;
    if (a?.jamPulang) r.totalMenitKerja += durasiMenit(a.jamMasuk, a.jamPulang);
  }

  if (jamMasukHariKerja.length) {
    r.rataJamMasuk = jamMasukHariKerja.reduce((s, x) => s + x, 0) / jamMasukHariKerja.length;
  }
  if (r.hariKerja) r.persenKehadiran = Math.round((r.hadir / r.hariKerja) * 100);
  return r;
}
