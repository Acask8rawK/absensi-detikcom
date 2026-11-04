"use server";

import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { berhasil, gagal, melanggarUnik, teks, type HasilAksi } from "@/lib/aksi";
import { wajibPeran } from "@/lib/auth";
import { db } from "@/lib/db";
import { dariDate, keDate, statusDariJamMasuk, tanggalWIB } from "@/lib/waktu";

function segarkanAdmin() {
  revalidatePath("/admin", "layout");
  revalidatePath("/peserta", "layout");
}

// Tanpa huruf/angka yang mirip (0/O, 1/l/I), supaya kata sandi sementara
// tidak salah ketik saat didiktekan ke peserta.
const HURUF = "abcdefghjkmnpqrstuvwxyz23456789";
function kataSandiSementara() {
  let s = "";
  for (let i = 0; i < 10; i++) s += HURUF[randomInt(HURUF.length)];
  return `${s.slice(0, 5)}-${s.slice(5)}`;
}

const skemaPeserta = z.object({
  nama: z.string().trim().min(3, "Nama minimal 3 karakter.").max(80),
  email: z.string().trim().toLowerCase().email("Format email belum benar."),
  kampus: z.string().trim().min(2, "Isi asal kampus.").max(80),
  role: z.string().trim().max(60),
  tanggalMulai: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pilih tanggal mulai magang."),
});

export async function tambahPeserta(_sebelumnya: HasilAksi, formData: FormData): Promise<HasilAksi> {
  await wajibPeran("ADMIN");
  const hasil = skemaPeserta.safeParse({
    nama: teks(formData, "nama"),
    email: teks(formData, "email"),
    kampus: teks(formData, "kampus"),
    role: teks(formData, "role"),
    tanggalMulai: teks(formData, "tanggalMulai"),
  });
  if (!hasil.success) return gagal(hasil.error.issues[0].message);

  const sandi = kataSandiSementara();
  try {
    await db.pengguna.create({
      data: {
        nama: hasil.data.nama,
        email: hasil.data.email,
        kampus: hasil.data.kampus,
        role: hasil.data.role || null,
        tanggalMulai: keDate(hasil.data.tanggalMulai),
        peran: "PESERTA",
        kataSandiHash: await bcrypt.hash(sandi, 10),
        wajibGantiSandi: true, // kata sandi sementara harus diganti saat login pertama
      },
    });
  } catch (e) {
    if (melanggarUnik(e)) return gagal("Email ini sudah terdaftar.");
    throw e;
  }

  segarkanAdmin();
  // Kata sandi sementara hanya ditampilkan sekali; yang tersimpan di database hanya hash-nya.
  return berhasil(`${hasil.data.nama} ditambahkan.`, { email: hasil.data.email, sandi });
}

export async function ubahStatusPeserta(id: string, aktif: boolean): Promise<HasilAksi> {
  await wajibPeran("ADMIN");
  // Dibatasi ke peran PESERTA, jadi admin tidak bisa menonaktifkan dirinya sendiri.
  const { count } = await db.pengguna.updateMany({
    where: { id, peran: "PESERTA" },
    // Tanggal selesai diisi supaya laporan berhenti menghitung Alpa setelah peserta dinonaktifkan.
    data: { aktif, tanggalSelesai: aktif ? null : keDate(tanggalWIB()) },
  });
  if (count === 0) return gagal("Peserta tidak ditemukan.");
  segarkanAdmin();
  return berhasil(aktif ? "Peserta diaktifkan kembali." : "Peserta dinonaktifkan dan tidak bisa login lagi.");
}

const skemaTinjau = z
  .object({
    keputusan: z.enum(["DISETUJUI", "DITOLAK"]),
    catatan: z.string().trim().max(300),
  })
  .refine((d) => d.keputusan === "DISETUJUI" || d.catatan.length >= 5, {
    message: "Tulis alasan penolakan (minimal 5 karakter) supaya peserta tahu harus bagaimana.",
  });

export async function tinjauIzin(id: string, keputusan: "DISETUJUI" | "DITOLAK", catatan: string): Promise<HasilAksi> {
  const admin = await wajibPeran("ADMIN");
  const hasil = skemaTinjau.safeParse({ keputusan, catatan });
  if (!hasil.success) return gagal(hasil.error.issues[0].message);

  // Syarat status MENUNGGU ada di WHERE: kalau dua admin menekan bersamaan,
  // hanya satu keputusan yang tersimpan.
  const { count } = await db.pengajuanIzin.updateMany({
    where: { id, status: "MENUNGGU" },
    data: { status: keputusan, catatanAdmin: hasil.data.catatan || null, ditinjauOlehId: admin.id, ditinjauPada: new Date() },
  });
  if (count === 0) return gagal("Pengajuan ini sudah diputuskan.");
  segarkanAdmin();
  return berhasil(keputusan === "DISETUJUI" ? "Pengajuan disetujui." : "Pengajuan ditolak.");
}

export async function tinjauKoreksi(id: string, keputusan: "DISETUJUI" | "DITOLAK", catatan: string): Promise<HasilAksi> {
  const admin = await wajibPeran("ADMIN");
  const hasil = skemaTinjau.safeParse({ keputusan, catatan });
  if (!hasil.success) return gagal(hasil.error.issues[0].message);

  try {
    // Satu transaksi: absensi dan status pengajuan berubah bersama, atau tidak sama sekali.
    await db.$transaction(async (tx) => {
      const koreksi = await tx.pengajuanKoreksi.findUnique({ where: { id } });
      if (!koreksi || koreksi.status !== "MENUNGGU") throw new Error("SUDAH_DIPUTUSKAN");

      const tandai = await tx.pengajuanKoreksi.updateMany({
        where: { id, status: "MENUNGGU" },
        data: { status: keputusan, catatanAdmin: hasil.data.catatan || null, ditinjauOlehId: admin.id, ditinjauPada: new Date() },
      });
      if (tandai.count === 0) throw new Error("SUDAH_DIPUTUSKAN");
      if (keputusan === "DITOLAK") return;

      const kunci = { penggunaId_tanggal: { penggunaId: koreksi.penggunaId, tanggal: koreksi.tanggal } };
      const lama = await tx.absensi.findUnique({ where: kunci });
      const jamMasuk = koreksi.jamMasukUsulan ?? lama?.jamMasuk;
      if (!jamMasuk) throw new Error("DATA_KURANG");
      const jamPulang = koreksi.jamPulangUsulan ?? lama?.jamPulang ?? null;
      // Status masuk dihitung ulang dari jam yang baru, dengan aturan yang sama seperti check-in.
      const { statusMasuk, menitTerlambat } = statusDariJamMasuk(jamMasuk, dariDate(koreksi.tanggal));

      await tx.absensi.upsert({
        where: kunci,
        create: { penggunaId: koreksi.penggunaId, tanggal: koreksi.tanggal, jamMasuk, jamPulang, statusMasuk, menitTerlambat, dikoreksi: true },
        update: { jamMasuk, jamPulang, statusMasuk, menitTerlambat, dikoreksi: true },
      });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "SUDAH_DIPUTUSKAN") return gagal("Koreksi ini sudah diputuskan.");
    if (e instanceof Error && e.message === "DATA_KURANG") return gagal("Koreksi ini tidak punya jam masuk yang bisa dipakai.");
    throw e;
  }

  segarkanAdmin();
  return berhasil(keputusan === "DISETUJUI" ? "Koreksi disetujui dan absensi diperbarui." : "Koreksi ditolak.");
}
