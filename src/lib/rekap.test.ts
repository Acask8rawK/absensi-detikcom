import { describe, expect, it } from "vitest";
import { bacaPeriode } from "./periode";
import { hitungRekap, statusPerTanggal, type AbsensiMentah, type PesertaMentah } from "./rekap";
import { keDate, waktuWIB } from "./waktu";

function absen(tanggal: string, masuk: string, pulang: string | null, statusMasuk: AbsensiMentah["statusMasuk"]): AbsensiMentah {
  return {
    tanggal: keDate(tanggal),
    jamMasuk: waktuWIB(tanggal, masuk),
    jamPulang: pulang ? waktuWIB(tanggal, pulang) : null,
    statusMasuk,
    menitTerlambat: 0,
    logbook: null,
    dikoreksi: false,
  };
}

// Peserta mulai Jumat 30 Okt. Hari ini Jumat 6 Nov dan ia belum check-in.
const peserta: PesertaMentah = {
  tanggalMulai: keDate("2026-10-30"),
  tanggalSelesai: null,
  absensi: [
    absen("2026-11-02", "08:50", "17:00", "TEPAT_WAKTU"), // 490 menit
    absen("2026-11-03", "09:30", "17:30", "TERLAMBAT"), // 480 menit
    absen("2026-11-04", "08:55", null, "TEPAT_WAKTU"), // lupa check-out
  ],
  izin: [{ jenis: "SAKIT", tanggalMulai: keDate("2026-11-05"), tanggalSelesai: keDate("2026-11-05") }],
};

describe("hitungRekap", () => {
  const r = hitungRekap(peserta, "2026-10-26", "2026-11-08", "2026-11-06");

  it("hanya menghitung hari kerja di dalam masa magang dan sampai kemarin", () => {
    // 30 Okt (alpa), 2, 3, 4, 5 Nov. Hari ini belum dihitung karena masih bisa check-in.
    expect(r.hariKerja).toBe(5);
  });

  it("memisahkan hadir, izin, sakit, alpa, dan tidak check-out", () => {
    expect(r).toMatchObject({ hadir: 3, tepatWaktu: 2, terlambat: 1, izin: 0, sakit: 1, alpa: 1, tidakCheckout: 1 });
  });

  it("menjumlah jam kerja hanya dari hari yang ada check-out", () => {
    expect(r.totalMenitKerja).toBe(970);
  });

  it("menghitung rata-rata jam masuk dan persentase kehadiran", () => {
    expect(r.rataJamMasuk).toBe((530 + 570 + 535) / 3);
    expect(r.persenKehadiran).toBe(60);
  });

  it("periode tanpa hari kerja tidak menghasilkan persentase", () => {
    const akhirPekan = hitungRekap(peserta, "2026-10-31", "2026-11-01", "2026-11-06");
    expect(akhirPekan.hariKerja).toBe(0);
    expect(akhirPekan.persenKehadiran).toBeNull();
  });
});

describe("statusPerTanggal", () => {
  it("izin yang melewati akhir pekan tidak mengubah Sabtu dan Minggu", () => {
    const p: PesertaMentah = { ...peserta, izin: [{ jenis: "IZIN", tanggalMulai: keDate("2026-11-06"), tanggalSelesai: keDate("2026-11-09") }] };
    const s = statusPerTanggal(p, ["2026-11-06", "2026-11-07", "2026-11-08", "2026-11-09"], "2026-11-10");
    expect([...s.values()]).toEqual(["IZIN", "LIBUR", "LIBUR", "IZIN"]);
  });
});

describe("bacaPeriode", () => {
  const hariIni = "2026-11-04";

  it("bulan ini dihitung sampai hari ini", () => {
    expect(bacaPeriode({}, hariIni)).toEqual({ id: "bulan-ini", dari: "2026-11-01", sampai: hariIni });
  });

  it("minggu ini dimulai hari Senin", () => {
    expect(bacaPeriode({ periode: "minggu-ini" }, hariIni)).toEqual({ id: "minggu-ini", dari: "2026-11-02", sampai: hariIni });
  });

  it("bulan lalu mengambil satu bulan penuh", () => {
    expect(bacaPeriode({ periode: "bulan-lalu" }, hariIni)).toEqual({ id: "bulan-lalu", dari: "2026-10-01", sampai: "2026-10-31" });
  });

  it("rentang kustom dipakai hanya kalau formatnya benar dan urutannya masuk akal", () => {
    expect(bacaPeriode({ dari: "2026-10-15", sampai: "2026-10-20" }, hariIni)).toEqual({ id: "kustom", dari: "2026-10-15", sampai: "2026-10-20" });
    expect(bacaPeriode({ dari: "2026-10-20", sampai: "2026-10-15" }, hariIni).id).toBe("bulan-ini");
    expect(bacaPeriode({ dari: "kemarin", sampai: "2026-10-15" }, hariIni).id).toBe("bulan-ini");
  });
});
