import "server-only";
import { db } from "./db";
import { hitungRekap, petaAbsensi, statusPerTanggal, type PesertaMentah } from "./rekap";
import { termasukHadir, type KodeStatus } from "./status";
import {
  akhirBulan, awalBulan, dariDate, hariKerjaTerakhir, keDate, rentangTanggal, type Tanggal,
} from "./waktu";

// Semua pembacaan data untuk halaman ada di sini. Halaman tidak menulis query sendiri,
// supaya aturan seperti "hanya izin yang disetujui" konsisten di semua tempat.

const pilihAbsensi = {
  tanggal: true, jamMasuk: true, jamPulang: true, statusMasuk: true, menitTerlambat: true, logbook: true, dikoreksi: true,
} as const;

/** Data mentah peserta dalam rentang tanggal, siap dihitung oleh rekap.ts. */
async function ambilPeserta(where: { id?: string; aktifSaja?: boolean; cari?: string }, dari: Tanggal, sampai: Tanggal) {
  return db.pengguna.findMany({
    where: {
      peran: "PESERTA",
      ...(where.id ? { id: where.id } : {}),
      ...(where.aktifSaja ? { aktif: true } : {}),
      ...(where.cari ? { nama: { contains: where.cari, mode: "insensitive" as const } } : {}),
    },
    orderBy: { nama: "asc" },
    select: {
      id: true, nama: true, email: true, kampus: true, role: true, aktif: true, tanggalMulai: true, tanggalSelesai: true,
      absensi: { where: { tanggal: { gte: keDate(dari), lte: keDate(sampai) } }, select: pilihAbsensi, orderBy: { tanggal: "desc" } },
      pengajuanIzin: {
        where: { status: "DISETUJUI", tanggalMulai: { lte: keDate(sampai) }, tanggalSelesai: { gte: keDate(dari) } },
        select: { jenis: true, tanggalMulai: true, tanggalSelesai: true },
      },
    },
  });
}

type BarisPeserta = Awaited<ReturnType<typeof ambilPeserta>>[number];
const keMentah = (p: BarisPeserta): PesertaMentah => ({
  tanggalMulai: p.tanggalMulai, tanggalSelesai: p.tanggalSelesai, absensi: p.absensi, izin: p.pengajuanIzin,
});

// ---------------- Peserta ----------------

export async function dataBerandaPeserta(penggunaId: string, hariIni: Tanggal) {
  const dari = awalBulan(hariIni);
  const [peserta] = await ambilPeserta({ id: penggunaId }, dari, akhirBulan(hariIni));
  const mentah = keMentah(peserta);
  const status = statusPerTanggal(mentah, rentangTanggal(dari, akhirBulan(hariIni)), hariIni);
  const absensiHariIni = peserta.absensi.find((a) => dariDate(a.tanggal) === hariIni) ?? null;
  const menunggu = await db.pengajuanIzin.count({ where: { penggunaId, status: "MENUNGGU" } })
    + await db.pengajuanKoreksi.count({ where: { penggunaId, status: "MENUNGGU" } });

  return {
    absensiHariIni,
    statusHariIni: status.get(hariIni)!,
    rekap: hitungRekap(mentah, dari, hariIni, hariIni),
    kalender: Object.fromEntries(status) as Record<Tanggal, KodeStatus>,
    terlambat: Object.fromEntries(peserta.absensi.filter((a) => a.menitTerlambat > 0).map((a) => [dariDate(a.tanggal), a.menitTerlambat])),
    menunggu,
  };
}

export async function dataRiwayatPeserta(penggunaId: string, bulan: Tanggal, hariIni: Tanggal) {
  const dari = awalBulan(bulan);
  const sampai = akhirBulan(bulan);
  const [peserta] = await ambilPeserta({ id: penggunaId }, dari, sampai);
  const mentah = keMentah(peserta);
  const status = statusPerTanggal(mentah, rentangTanggal(dari, sampai), hariIni);
  const abs = petaAbsensi(peserta.absensi);
  const koreksi = await db.pengajuanKoreksi.findMany({
    where: { penggunaId, tanggal: { gte: keDate(dari), lte: keDate(sampai) } },
    select: { tanggal: true, status: true },
    orderBy: { dibuatPada: "desc" },
  });
  const koreksiPerTanggal = new Map<Tanggal, string>();
  for (const k of koreksi) if (!koreksiPerTanggal.has(dariDate(k.tanggal))) koreksiPerTanggal.set(dariDate(k.tanggal), k.status);

  // Baris riwayat: hanya tanggal yang ada isinya, terbaru di atas.
  const baris = rentangTanggal(dari, sampai < hariIni ? sampai : hariIni)
    .reverse()
    .map((t) => ({ tanggal: t, status: status.get(t)!, absensi: abs.get(t) ?? null, koreksi: koreksiPerTanggal.get(t) ?? null }))
    .filter((b) => b.absensi || (b.status !== "LIBUR" && b.status !== "DI_LUAR_PERIODE"));

  return {
    baris,
    kalender: Object.fromEntries(status) as Record<Tanggal, KodeStatus>,
    terlambat: Object.fromEntries(peserta.absensi.filter((a) => a.menitTerlambat > 0).map((a) => [dariDate(a.tanggal), a.menitTerlambat])),
    rekap: hitungRekap(mentah, dari, sampai < hariIni ? sampai : hariIni, hariIni),
  };
}

export async function dataPengajuanPeserta(penggunaId: string) {
  const [izin, koreksi] = await Promise.all([
    db.pengajuanIzin.findMany({
      where: { penggunaId },
      orderBy: { dibuatPada: "desc" },
      take: 30,
      include: { ditinjauOleh: { select: { nama: true } } },
    }),
    db.pengajuanKoreksi.findMany({
      where: { penggunaId },
      orderBy: { dibuatPada: "desc" },
      take: 30,
      include: { ditinjauOleh: { select: { nama: true } } },
    }),
  ]);
  return { izin, koreksi };
}

// ---------------- Admin ----------------

export async function dataDashboard(hariIni: Tanggal) {
  const sepuluhHari = hariKerjaTerakhir(hariIni, 10);
  const dari = sepuluhHari[0] < awalBulan(hariIni) ? sepuluhHari[0] : awalBulan(hariIni);
  const peserta = await ambilPeserta({ aktifSaja: true }, dari, hariIni);

  const hariIniPeserta = peserta.map((p) => {
    const mentah = keMentah(p);
    const kode = statusPerTanggal(mentah, [hariIni], hariIni).get(hariIni)!;
    const absensi = p.absensi.find((a) => dariDate(a.tanggal) === hariIni) ?? null;
    const logbookTerakhir = p.absensi.find((a) => a.logbook)?.logbook ?? null;
    return { id: p.id, nama: p.nama, kampus: p.kampus, kode, absensi, logbookTerakhir };
  });

  // Grafik kehadiran 10 hari kerja: skala tetap = jumlah peserta aktif.
  const grafik = sepuluhHari.map((t) => {
    const hitung = { tanggal: t, tepat: 0, telat: 0, izinSakit: 0, alpa: 0 };
    for (const p of peserta) {
      const kode = statusPerTanggal(keMentah(p), [t], hariIni).get(t)!;
      if (termasukHadir(kode)) {
        const telat = p.absensi.find((a) => dariDate(a.tanggal) === t)?.statusMasuk === "TERLAMBAT";
        if (telat) hitung.telat++;
        else hitung.tepat++;
      } else if (kode === "IZIN" || kode === "SAKIT") hitung.izinSakit++;
      else if (kode === "ALPA") hitung.alpa++;
    }
    return hitung;
  });

  const rekapBulan = peserta.map((p) => hitungRekap(keMentah(p), awalBulan(hariIni), hariIni, hariIni));
  const total = rekapBulan.reduce(
    (s, r) => ({ sakit: s.sakit + r.sakit, izin: s.izin + r.izin, alpa: s.alpa + r.alpa, tidakCheckout: s.tidakCheckout + r.tidakCheckout, hadir: s.hadir + r.hadir, hariKerja: s.hariKerja + r.hariKerja }),
    { sakit: 0, izin: 0, alpa: 0, tidakCheckout: 0, hadir: 0, hariKerja: 0 },
  );

  const [izinMenunggu, koreksiMenunggu] = await Promise.all([
    db.pengajuanIzin.findMany({ where: { status: "MENUNGGU" }, orderBy: { dibuatPada: "asc" }, include: { pengguna: { select: { nama: true } } } }),
    db.pengajuanKoreksi.findMany({ where: { status: "MENUNGGU" }, orderBy: { dibuatPada: "asc" }, include: { pengguna: { select: { nama: true } } } }),
  ]);

  return { hariIniPeserta, grafik, total, izinMenunggu, koreksiMenunggu, jumlahPeserta: peserta.length };
}

export async function dataDaftarPeserta(cari: string, hariIni: Tanggal) {
  const peserta = await ambilPeserta({ cari }, awalBulan(hariIni), hariIni);
  return peserta.map((p) => {
    const mentah = keMentah(p);
    const kode = p.aktif ? statusPerTanggal(mentah, [hariIni], hariIni).get(hariIni)! : ("DI_LUAR_PERIODE" as KodeStatus);
    const absensi = p.absensi.find((a) => dariDate(a.tanggal) === hariIni) ?? null;
    return {
      id: p.id, nama: p.nama, email: p.email, kampus: p.kampus, role: p.role, aktif: p.aktif,
      tanggalMulai: p.tanggalMulai ? dariDate(p.tanggalMulai) : null,
      kode, absensi, rekap: hitungRekap(mentah, awalBulan(hariIni), hariIni, hariIni),
    };
  });
}

export async function dataDetailPeserta(id: string, bulan: Tanggal, hariIni: Tanggal) {
  const pengguna = await db.pengguna.findFirst({
    where: { id, peran: "PESERTA" },
    select: { id: true, nama: true, email: true, kampus: true, role: true, aktif: true, tanggalMulai: true },
  });
  if (!pengguna) return null;
  const riwayat = await dataRiwayatPeserta(id, bulan, hariIni);
  return { pengguna, ...riwayat };
}

export async function dataLaporan(dari: Tanggal, sampai: Tanggal, cari: string, hariIni: Tanggal) {
  const batas = sampai < hariIni ? sampai : hariIni;
  const peserta = await ambilPeserta({ cari }, dari, batas);
  return peserta.map((p) => ({ id: p.id, nama: p.nama, kampus: p.kampus, aktif: p.aktif, rekap: hitungRekap(keMentah(p), dari, batas, hariIni) }));
}

export async function dataPersetujuan() {
  const sertakan = { pengguna: { select: { nama: true, kampus: true } }, ditinjauOleh: { select: { nama: true } } } as const;
  const [izinMenunggu, koreksiMenunggu, izinSelesai, koreksiSelesai] = await Promise.all([
    db.pengajuanIzin.findMany({ where: { status: "MENUNGGU" }, orderBy: { dibuatPada: "asc" }, include: sertakan }),
    db.pengajuanKoreksi.findMany({ where: { status: "MENUNGGU" }, orderBy: { dibuatPada: "asc" }, include: sertakan }),
    db.pengajuanIzin.findMany({ where: { status: { not: "MENUNGGU" } }, orderBy: { ditinjauPada: "desc" }, take: 20, include: sertakan }),
    db.pengajuanKoreksi.findMany({ where: { status: { not: "MENUNGGU" } }, orderBy: { ditinjauPada: "desc" }, take: 20, include: sertakan }),
  ]);
  // Untuk koreksi, tampilkan juga jam yang tercatat sekarang supaya admin bisa membandingkan.
  const absensiTerkait = koreksiMenunggu.length
    ? await db.absensi.findMany({
        where: { OR: koreksiMenunggu.map((k) => ({ penggunaId: k.penggunaId, tanggal: k.tanggal })) },
        select: { penggunaId: true, tanggal: true, jamMasuk: true, jamPulang: true },
      })
    : [];
  return { izinMenunggu, koreksiMenunggu, izinSelesai, koreksiSelesai, absensiTerkait };
}

export async function jumlahMenunggu() {
  const [a, b] = await Promise.all([
    db.pengajuanIzin.count({ where: { status: "MENUNGGU" } }),
    db.pengajuanKoreksi.count({ where: { status: "MENUNGGU" } }),
  ]);
  return a + b;
}

