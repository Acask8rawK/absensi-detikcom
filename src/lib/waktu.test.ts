import { describe, expect, it } from "vitest";
import {
  akhirBulan,
  awalMinggu,
  formatDurasi,
  formatJam,
  formatTanggal,
  hariKerja,
  hariKerjaTerakhir,
  menitDalamHariWIB,
  selisihHari,
  statusDariJamMasuk,
  tanggalWIB,
  waktuWIB,
} from "./waktu";

// 5 November 2026 jatuh pada hari Kamis.

describe("tanggal dan jam WIB", () => {
  it("memakai tanggal Jakarta walaupun server berjalan di UTC", () => {
    // 18.30 UTC tanggal 4 = 01.30 WIB tanggal 5
    expect(tanggalWIB(new Date("2026-11-04T18:30:00Z"))).toBe("2026-11-05");
    expect(tanggalWIB(new Date("2026-11-04T16:59:00Z"))).toBe("2026-11-04");
  });

  it("menghitung menit sejak tengah malam WIB", () => {
    expect(menitDalamHariWIB(new Date("2026-11-05T01:47:00Z"))).toBe(8 * 60 + 47);
  });

  it("mengenali hari kerja Senin sampai Jumat", () => {
    expect(hariKerja("2026-11-05")).toBe(true);
    expect(hariKerja("2026-11-07")).toBe(false);
    expect(hariKerja("2026-11-08")).toBe(false);
  });

  it("mencari Senin di minggu yang sama, termasuk dari hari Minggu", () => {
    expect(awalMinggu("2026-11-05")).toBe("2026-11-02");
    expect(awalMinggu("2026-11-08")).toBe("2026-11-02");
    expect(awalMinggu("2026-11-02")).toBe("2026-11-02");
  });

  it("menghitung akhir bulan, termasuk Februari tahun kabisat", () => {
    expect(akhirBulan("2026-02-10")).toBe("2026-02-28");
    expect(akhirBulan("2028-02-03")).toBe("2028-02-29");
    expect(akhirBulan("2026-11-05")).toBe("2026-11-30");
  });

  it("melompati akhir pekan saat mengambil hari kerja terakhir", () => {
    expect(hariKerjaTerakhir("2026-11-09", 3)).toEqual(["2026-11-05", "2026-11-06", "2026-11-09"]);
  });

  it("menghitung selisih hari antar tanggal", () => {
    expect(selisihHari("2026-10-29", "2026-11-05")).toBe(7);
  });
});

describe("status jam masuk", () => {
  it("masih tepat waktu sampai 09.15", () => {
    expect(statusDariJamMasuk(waktuWIB("2026-11-05", "08:47"), "2026-11-05")).toEqual({ statusMasuk: "TEPAT_WAKTU", menitTerlambat: 0 });
    expect(statusDariJamMasuk(waktuWIB("2026-11-05", "09:15"), "2026-11-05")).toEqual({ statusMasuk: "TEPAT_WAKTU", menitTerlambat: 0 });
  });

  it("terlambat mulai 09.16 dan menitnya dihitung dari 09.00", () => {
    expect(statusDariJamMasuk(waktuWIB("2026-11-05", "09:16"), "2026-11-05")).toEqual({ statusMasuk: "TERLAMBAT", menitTerlambat: 16 });
    expect(statusDariJamMasuk(waktuWIB("2026-11-05", "10:05"), "2026-11-05")).toEqual({ statusMasuk: "TERLAMBAT", menitTerlambat: 65 });
  });

  it("check-in di akhir pekan dicatat sebagai hari libur", () => {
    expect(statusDariJamMasuk(waktuWIB("2026-11-07", "10:00"), "2026-11-07").statusMasuk).toBe("HARI_LIBUR");
  });
});

describe("format tampilan", () => {
  it("menulis tanggal dan jam dalam bahasa Indonesia", () => {
    expect(formatTanggal("2026-11-05")).toBe("Kamis, 5 November 2026");
    expect(formatJam(waktuWIB("2026-11-05", "08:47"))).toBe("08.47");
    expect(formatJam(null)).toBe("–");
  });

  it("menulis durasi kerja", () => {
    expect(formatDurasi(462)).toBe("7 j 42 m");
    expect(formatDurasi(480)).toBe("8 j 00 m");
    expect(formatDurasi(5)).toBe("5 m");
  });
});
