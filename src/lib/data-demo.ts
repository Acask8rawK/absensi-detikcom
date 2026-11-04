import bcrypt from "bcryptjs";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { hariKerja, hariKerjaTerakhir, keDate, statusDariJamMasuk, tambahHari, tanggalWIB, waktuWIB } from "./waktu";

// Data contoh untuk penguji: 1 admin + 6 peserta dengan riwayat dua minggu kerja,
// beberapa izin, dan koreksi yang menunggu. Semua nama dan email fiktif.
// Dipakai oleh `npm run db:seed` dan oleh cron harian yang menyegarkan demo,
// jadi riwayatnya selalu berakhir kemarin, berapa hari pun setelah dikumpulkan.
// File ini sengaja tidak memakai lib/db.ts supaya bisa dijalankan dari skrip seed.

export const SANDI_DEMO = "demo12345";

const PESERTA = [
  { nama: "Rina Maharani", email: "rina@peserta.hadir.id", kampus: "Universitas Indonesia", role: "UI/UX Designer", demo: true, pola: "rajin" },
  { nama: "Bagas Pratama", email: "bagas@peserta.hadir.id", kampus: "Telkom University", role: "Backend Developer", pola: "rajin" },
  { nama: "Sari Wulandari", email: "sari@peserta.hadir.id", kampus: "Universitas Gadjah Mada", role: "UX Researcher", pola: "rajin" },
  { nama: "Dimas Saputra", email: "dimas@peserta.hadir.id", kampus: "BINUS University", role: "Backend Developer", pola: "telat" },
  { nama: "Ayu Lestari", email: "ayu@peserta.hadir.id", kampus: "Universitas Negeri Jakarta", role: "Data Analyst", pola: "sakit" },
  { nama: "Fajar Nugroho", email: "fajar@peserta.hadir.id", kampus: "Universitas Gunadarma", role: "Frontend Developer", pola: "lupa" },
] as const;

const LOGBOOK = [
  "Merapikan komponen tabel laporan dan menambah state kosong.",
  "Menulis unit test untuk perhitungan status kehadiran.",
  "Rapat sprint planning, lalu memecah tiket fitur notifikasi.",
  "Memperbaiki bug format tanggal di halaman riwayat.",
  "Riset pengguna: wawancara 3 peserta tentang alur izin.",
  "Migrasi skema tabel absensi dan menulis dokumentasinya.",
  "Code review pull request tim frontend.",
  "Membuat grafik kehadiran mingguan untuk dashboard.",
  "Mempelajari alur deploy dan monitoring di tim infrastruktur.",
  "Menyusun laporan mingguan untuk mentor.",
];

const jam = (menit: number) => `${String(Math.floor(menit / 60)).padStart(2, "0")}:${String(menit % 60).padStart(2, "0")}`;

export async function isiDataDemo(db: PrismaClient) {
  // Generator acak dengan benih tetap: pola data selalu sama setiap kali diisi ulang.
  let benih = 20261105;
  const acak = () => {
    benih = (benih * 1103515245 + 12345) % 2 ** 31;
    return benih / 2 ** 31;
  };
  const antara = (min: number, max: number) => Math.floor(min + acak() * (max - min + 1));

  const sekarang = new Date();
  const hariIni = tanggalWIB(sekarang);
  // Dua minggu kerja sebelum hari ini menjadi riwayat. Hari ini dibiarkan
  // kosong untuk peserta demo, supaya penguji bisa mencoba check-in sendiri.
  const riwayat = hariKerjaTerakhir(tambahHari(hariIni, -1), 10);
  const tanggalMulai = riwayat[0];

  await db.pengajuanKoreksi.deleteMany();
  await db.pengajuanIzin.deleteMany();
  await db.absensi.deleteMany();
  // Akun demo diperbarui, bukan dibuat ulang: id-nya tetap, jadi penguji yang sedang
  // login tidak tiba-tiba keluar saat data disegarkan. Akun lain (misalnya peserta
  // yang ditambahkan penguji) dihapus.
  await db.pengguna.deleteMany({ where: { email: { notIn: ["admin@hadir.id", ...PESERTA.map((p) => p.email)] } } });

  const hash = await bcrypt.hash(SANDI_DEMO, 10);
  const simpanAkun = (data: Prisma.PenggunaCreateInput) =>
    db.pengguna.upsert({ where: { email: data.email }, create: data, update: { ...data, aktif: true, wajibGantiSandi: false } });

  const admin = await simpanAkun({ nama: "Admin Demo", email: "admin@hadir.id", kataSandiHash: hash, peran: "ADMIN", role: "HR Officer", akunDemo: true });

  for (const p of PESERTA) {
    const peserta = await simpanAkun({
      nama: p.nama, email: p.email, kampus: p.kampus, role: p.role, peran: "PESERTA",
      kataSandiHash: hash, tanggalMulai: keDate(tanggalMulai), akunDemo: "demo" in p && p.demo,
    });

    const izinHari = new Set<string>();
    if (p.pola === "sakit") {
      izinHari.add(riwayat[3]);
      izinHari.add(riwayat[7]);
    }
    if (p.nama.startsWith("Sari")) izinHari.add(riwayat[5]);

    // Semua absensi satu peserta dikumpulkan dulu, lalu disimpan sekaligus.
    const absensi = [];
    for (const [i, tanggal] of riwayat.entries()) {
      if (izinHari.has(tanggal)) continue;
      if (p.pola === "lupa" && i === 6) continue; // satu hari Alpa

      // Pola keterlambatan per karakter peserta, supaya grafik dan laporan bervariasi.
      const telat = p.pola === "telat" ? acak() < 0.5 : acak() < 0.12;
      const menitMasuk = telat ? antara(9 * 60 + 18, 9 * 60 + 55) : antara(8 * 60 + 25, 9 * 60 + 10);
      const masuk = waktuWIB(tanggal, jam(menitMasuk));
      const lupaPulang = p.pola === "lupa" && i === 8;
      const pulang = lupaPulang ? null : waktuWIB(tanggal, jam(menitMasuk + antara(8 * 60, 9 * 60 + 15)));
      absensi.push({
        penggunaId: peserta.id, tanggal: keDate(tanggal), jamMasuk: masuk, jamPulang: pulang,
        ...statusDariJamMasuk(masuk, tanggal),
        logbook: pulang ? LOGBOOK[(i + antara(0, 9)) % LOGBOOK.length] : null,
        // Satu absensi Fajar sudah pernah dikoreksi, supaya cap DIKOREKSI terlihat.
        dikoreksi: p.pola === "lupa" && i === 3,
      });
    }

    // Absensi hari ini untuk sebagian peserta (selain peserta demo), supaya dashboard admin hidup.
    // Hanya yang jamnya sudah lewat; jam pulang diisi kalau hari kerjanya juga sudah selesai.
    if (hariKerja(hariIni) && !("demo" in p) && p.pola !== "sakit" && p.pola !== "lupa") {
      const menitMasuk = p.pola === "telat" ? 9 * 60 + 37 : antara(8 * 60 + 40, 9 * 60 + 5);
      const masuk = waktuWIB(hariIni, jam(menitMasuk));
      const pulang = waktuWIB(hariIni, jam(menitMasuk + 8 * 60 + 20));
      if (masuk < sekarang) {
        const sudahPulang = pulang < sekarang;
        absensi.push({
          penggunaId: peserta.id, tanggal: keDate(hariIni), jamMasuk: masuk, jamPulang: sudahPulang ? pulang : null,
          ...statusDariJamMasuk(masuk, hariIni),
          logbook: sudahPulang ? LOGBOOK[antara(0, 9)] : null, dikoreksi: false,
        });
      }
    }
    await db.absensi.createMany({ data: absensi });

    if (p.pola === "sakit") {
      await db.pengajuanIzin.createMany({
        data: [
          { penggunaId: peserta.id, jenis: "SAKIT", tanggalMulai: keDate(riwayat[3]), tanggalSelesai: keDate(riwayat[3]), alasan: "Demam dan flu, sudah ke klinik.", status: "DISETUJUI", ditinjauOlehId: admin.id, ditinjauPada: waktuWIB(riwayat[3], "10:12") },
          { penggunaId: peserta.id, jenis: "IZIN", tanggalMulai: keDate(riwayat[7]), tanggalSelesai: keDate(riwayat[7]), alasan: "Mengurus berkas wisuda di kampus.", status: "DISETUJUI", ditinjauOlehId: admin.id, ditinjauPada: waktuWIB(riwayat[6], "15:40") },
          { penggunaId: peserta.id, jenis: "SAKIT", tanggalMulai: keDate(hariIni), tanggalSelesai: keDate(hariIni), alasan: "Sakit kepala sejak pagi, surat dokter menyusul.", status: "MENUNGGU" },
        ],
      });
    }
    if (p.nama.startsWith("Sari")) {
      await db.pengajuanIzin.createMany({
        data: [
          { penggunaId: peserta.id, jenis: "IZIN", tanggalMulai: keDate(riwayat[5]), tanggalSelesai: keDate(riwayat[5]), alasan: "Menghadiri wisuda kakak di Yogyakarta.", status: "DISETUJUI", ditinjauOlehId: admin.id, ditinjauPada: waktuWIB(riwayat[4], "09:30") },
          { penggunaId: peserta.id, jenis: "IZIN", tanggalMulai: keDate(tambahHari(hariIni, 2)), tanggalSelesai: keDate(tambahHari(hariIni, 2)), alasan: "Ujian sidang skripsi di kampus.", status: "MENUNGGU" },
        ],
      });
    }
    if (p.nama.startsWith("Dimas")) {
      await db.pengajuanIzin.create({
        data: { penggunaId: peserta.id, jenis: "IZIN", tanggalMulai: keDate(riwayat[2]), tanggalSelesai: keDate(riwayat[2]), alasan: "Ada acara keluarga.", status: "DITOLAK", catatanAdmin: "Diajukan setelah hari H tanpa kabar ke mentor.", ditinjauOlehId: admin.id, ditinjauPada: waktuWIB(riwayat[3], "08:55") },
      });
    }
    if (p.pola === "lupa") {
      await db.pengajuanKoreksi.create({
        data: { penggunaId: peserta.id, tanggal: keDate(riwayat[8]), jamPulangUsulan: waktuWIB(riwayat[8], "17:10"), alasan: "Lupa check-out karena langsung ikut rapat sore dengan mentor." },
      });
    }
  }

  return { dari: tanggalMulai, sampai: hariIni };
}
