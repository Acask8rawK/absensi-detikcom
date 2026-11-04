import { hariKerja, type Tanggal } from "./waktu";

// Penentuan status satu peserta pada satu tanggal (flowchart FC-6).
// Fungsi ini murni: tidak membaca database, jadi mudah diuji dan dipakai ulang
// oleh beranda, kalender, dashboard, dan laporan.

export type KodeStatus =
  | "TEPAT_WAKTU"
  | "TERLAMBAT"
  | "LEMBUR_LIBUR"
  | "SEDANG_BEKERJA"
  | "TIDAK_CHECKOUT"
  | "IZIN"
  | "SAKIT"
  | "ALPA"
  | "BELUM_ABSEN"
  | "LIBUR"
  | "DI_LUAR_PERIODE";

export type AbsensiRingkas = {
  statusMasuk: "TEPAT_WAKTU" | "TERLAMBAT" | "HARI_LIBUR";
  jamPulang: Date | null;
};

export type InputStatus = {
  tanggal: Tanggal;
  hariIni: Tanggal;
  absensi?: AbsensiRingkas | null;
  izin?: "IZIN" | "SAKIT" | null; // hanya izin yang sudah disetujui
  mulai?: Tanggal | null; // tanggal mulai magang
  selesai?: Tanggal | null; // tanggal selesai magang, atau tanggal dinonaktifkan
};

export function statusHarian(p: InputStatus): KodeStatus {
  if (p.tanggal > p.hariIni) return "DI_LUAR_PERIODE";
  if ((p.mulai && p.tanggal < p.mulai) || (p.selesai && p.tanggal > p.selesai)) return "DI_LUAR_PERIODE";

  if (p.absensi) {
    if (p.absensi.jamPulang) {
      if (p.absensi.statusMasuk === "HARI_LIBUR") return "LEMBUR_LIBUR";
      return p.absensi.statusMasuk;
    }
    return p.tanggal < p.hariIni ? "TIDAK_CHECKOUT" : "SEDANG_BEKERJA";
  }

  // Akhir pekan dicek sebelum izin, supaya izin yang mencakup Sabtu–Minggu
  // tidak menambah hitungan hari izin.
  if (!hariKerja(p.tanggal)) return "LIBUR";
  if (p.izin) return p.izin;
  return p.tanggal < p.hariIni ? "ALPA" : "BELUM_ABSEN";
}

/** Status yang berarti peserta datang ke kantor. */
export function termasukHadir(kode: KodeStatus) {
  return kode === "TEPAT_WAKTU" || kode === "TERLAMBAT" || kode === "SEDANG_BEKERJA" || kode === "TIDAK_CHECKOUT";
}

/** Hari kerja yang ikut dihitung dalam persentase kehadiran. */
export function termasukHariKerjaDihitung(kode: KodeStatus) {
  return kode !== "LIBUR" && kode !== "LEMBUR_LIBUR" && kode !== "DI_LUAR_PERIODE" && kode !== "BELUM_ABSEN";
}

export const INFO_STATUS: Record<KodeStatus, { label: string; nada: Nada }> = {
  TEPAT_WAKTU: { label: "Tepat waktu", nada: "tepat" },
  TERLAMBAT: { label: "Terlambat", nada: "telat" },
  LEMBUR_LIBUR: { label: "Hari libur", nada: "libur" },
  SEDANG_BEKERJA: { label: "Sedang bekerja", nada: "tepat" },
  TIDAK_CHECKOUT: { label: "Tidak check-out", nada: "keluar" },
  IZIN: { label: "Izin", nada: "izin" },
  SAKIT: { label: "Sakit", nada: "sakit" },
  ALPA: { label: "Alpa", nada: "alpa" },
  BELUM_ABSEN: { label: "Belum absen", nada: "libur" },
  LIBUR: { label: "Libur", nada: "libur" },
  DI_LUAR_PERIODE: { label: "–", nada: "libur" },
};

export type Nada = "tepat" | "telat" | "izin" | "sakit" | "alpa" | "keluar" | "libur";
