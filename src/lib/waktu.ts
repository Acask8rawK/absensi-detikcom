import { JAM_MASUK_MENIT, TOLERANSI_MENIT } from "./konfigurasi";

// Semua urusan tanggal dan jam lewat file ini. Server Vercel berjalan di UTC,
// sedangkan kantor di Jakarta, jadi "hari ini" harus selalu dihitung dalam WIB.

const ZONA = "Asia/Jakarta";

/** Tanggal kalender dalam format "YYYY-MM-DD". */
export type Tanggal = string;

const fmtTanggalISO = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const fmtJam24 = new Intl.DateTimeFormat("en-GB", {
  timeZone: ZONA,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const fmtJam = new Intl.DateTimeFormat("id-ID", {
  timeZone: ZONA,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function tanggalWIB(saat: Date = new Date()): Tanggal {
  return fmtTanggalISO.format(saat);
}

/** Menit sejak tengah malam WIB, misalnya 08.47 menjadi 527. */
export function menitDalamHariWIB(saat: Date): number {
  const [jam, menit] = fmtJam24.format(saat).split(":").map(Number);
  return jam * 60 + menit;
}

// Kolom DATE di Postgres dibaca Prisma sebagai Date pada tengah malam UTC.
// Dua fungsi ini menerjemahkan bolak-balik tanpa menggeser tanggalnya.
export function keDate(t: Tanggal): Date {
  return new Date(`${t}T00:00:00.000Z`);
}
export function dariDate(d: Date): Tanggal {
  return d.toISOString().slice(0, 10);
}

/** 0 = Minggu … 6 = Sabtu */
export function hariDalamMinggu(t: Tanggal): number {
  return keDate(t).getUTCDay();
}

export function hariKerja(t: Tanggal): boolean {
  const h = hariDalamMinggu(t);
  return h !== 0 && h !== 6;
}

export function tambahHari(t: Tanggal, n: number): Tanggal {
  const d = keDate(t);
  d.setUTCDate(d.getUTCDate() + n);
  return dariDate(d);
}

export function selisihHari(dari: Tanggal, sampai: Tanggal): number {
  return Math.round((keDate(sampai).getTime() - keDate(dari).getTime()) / 86_400_000);
}

export function rentangTanggal(dari: Tanggal, sampai: Tanggal): Tanggal[] {
  const hasil: Tanggal[] = [];
  for (let t = dari; t <= sampai; t = tambahHari(t, 1)) hasil.push(t);
  return hasil;
}

/** n hari kerja terakhir sampai dengan `sampai`, urut dari yang paling lama. */
export function hariKerjaTerakhir(sampai: Tanggal, n: number): Tanggal[] {
  const hasil: Tanggal[] = [];
  for (let t = sampai; hasil.length < n; t = tambahHari(t, -1)) {
    if (hariKerja(t)) hasil.unshift(t);
  }
  return hasil;
}

export function awalBulan(t: Tanggal): Tanggal {
  return `${t.slice(0, 7)}-01`;
}

export function akhirBulan(t: Tanggal): Tanggal {
  const [y, m] = t.split("-").map(Number);
  return dariDate(new Date(Date.UTC(y, m, 0)));
}

/** Senin pada minggu yang sama. */
export function awalMinggu(t: Tanggal): Tanggal {
  const h = hariDalamMinggu(t);
  return tambahHari(t, h === 0 ? -6 : 1 - h);
}

/** Jam WIB pada tanggal tertentu, misalnya waktuWIB("2026-11-03", "17:10"). */
export function waktuWIB(t: Tanggal, jam: string): Date {
  return new Date(`${t}T${jam}:00+07:00`);
}

export function statusDariJamMasuk(saat: Date, tanggal: Tanggal) {
  if (!hariKerja(tanggal)) return { statusMasuk: "HARI_LIBUR" as const, menitTerlambat: 0 };
  const menit = menitDalamHariWIB(saat);
  // Toleransi hanya menentukan status; menit terlambat tetap dihitung dari 09.00.
  if (menit <= JAM_MASUK_MENIT + TOLERANSI_MENIT) return { statusMasuk: "TEPAT_WAKTU" as const, menitTerlambat: 0 };
  return { statusMasuk: "TERLAMBAT" as const, menitTerlambat: menit - JAM_MASUK_MENIT };
}

// ---------- format tampilan ----------

const fmtPanjang = new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" });
const fmtSedang = new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" });
const fmtPendek = new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", day: "numeric", month: "short" });
const fmtBulan = new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", month: "long", year: "numeric" });

/** "Kamis, 5 November 2026" */
export function formatTanggal(t: Tanggal) {
  return fmtPanjang.format(keDate(t));
}
/** "Kam, 5 Nov" */
export function formatTanggalSedang(t: Tanggal) {
  return fmtSedang.format(keDate(t));
}
/** "5 Nov" */
export function formatTanggalPendek(t: Tanggal) {
  return fmtPendek.format(keDate(t));
}
/** "November 2026" */
export function formatBulan(t: Tanggal) {
  return fmtBulan.format(keDate(t));
}

/** "08.47" */
export function formatJam(saat: Date | null | undefined) {
  return saat ? fmtJam.format(saat) : "–";
}

/** "08:47", untuk mengisi input type="time". */
export function jamUntukInput(saat: Date | null | undefined) {
  return saat ? fmtJam24.format(saat) : "";
}

export function formatMenitHari(menit: number) {
  const j = Math.floor(menit / 60);
  const m = Math.round(menit % 60);
  return `${String(j).padStart(2, "0")}.${String(m).padStart(2, "0")}`;
}

/** "7 j 42 m" */
export function formatDurasi(menit: number) {
  const j = Math.floor(menit / 60);
  const m = Math.round(menit % 60);
  if (j === 0) return `${m} m`;
  return `${j} j ${String(m).padStart(2, "0")} m`;
}

export function durasiMenit(masuk: Date, pulang: Date) {
  return Math.max(0, Math.round((pulang.getTime() - masuk.getTime()) / 60_000));
}
