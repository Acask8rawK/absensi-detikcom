import { describe, expect, it } from "vitest";
import { statusHarian } from "./status";

// Urutan pengecekan mengikuti flowchart FC-6.
const hariIni = "2026-11-05"; // Kamis
const pulang = new Date("2026-11-04T10:00:00Z");

describe("statusHarian", () => {
  it("tanggal yang belum terjadi atau di luar masa magang tidak dinilai", () => {
    expect(statusHarian({ tanggal: "2026-11-06", hariIni })).toBe("DI_LUAR_PERIODE");
    expect(statusHarian({ tanggal: "2026-10-30", hariIni, mulai: "2026-11-02" })).toBe("DI_LUAR_PERIODE");
    expect(statusHarian({ tanggal: "2026-11-04", hariIni, selesai: "2026-11-03" })).toBe("DI_LUAR_PERIODE");
  });

  it("absensi lengkap memakai status jam masuknya", () => {
    expect(statusHarian({ tanggal: "2026-11-04", hariIni, absensi: { statusMasuk: "TEPAT_WAKTU", jamPulang: pulang } })).toBe("TEPAT_WAKTU");
    expect(statusHarian({ tanggal: "2026-11-04", hariIni, absensi: { statusMasuk: "TERLAMBAT", jamPulang: pulang } })).toBe("TERLAMBAT");
    expect(statusHarian({ tanggal: "2026-11-01", hariIni, absensi: { statusMasuk: "HARI_LIBUR", jamPulang: pulang } })).toBe("LEMBUR_LIBUR");
  });

  it("belum check-out: hari ini masih bekerja, hari kemarin dianggap lupa", () => {
    expect(statusHarian({ tanggal: hariIni, hariIni, absensi: { statusMasuk: "TEPAT_WAKTU", jamPulang: null } })).toBe("SEDANG_BEKERJA");
    expect(statusHarian({ tanggal: "2026-11-04", hariIni, absensi: { statusMasuk: "TEPAT_WAKTU", jamPulang: null } })).toBe("TIDAK_CHECKOUT");
  });

  it("akhir pekan tetap libur walaupun tercakup izin", () => {
    expect(statusHarian({ tanggal: "2026-11-01", hariIni, izin: "SAKIT" })).toBe("LIBUR");
  });

  it("izin yang disetujui menggantikan alpa", () => {
    expect(statusHarian({ tanggal: "2026-11-04", hariIni, izin: "SAKIT" })).toBe("SAKIT");
    expect(statusHarian({ tanggal: "2026-11-04", hariIni, izin: "IZIN" })).toBe("IZIN");
  });

  it("hari kerja tanpa data: alpa kalau sudah lewat, belum absen kalau hari ini", () => {
    expect(statusHarian({ tanggal: "2026-11-04", hariIni })).toBe("ALPA");
    expect(statusHarian({ tanggal: hariIni, hariIni })).toBe("BELUM_ABSEN");
  });
});
