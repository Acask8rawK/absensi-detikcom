"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { berhasil, gagal, melanggarUnik, teks, type HasilAksi } from "@/lib/aksi";
import { wajibPeran } from "@/lib/auth";
import { db } from "@/lib/db";
import { BATAS_KOREKSI_HARI, MAKS_HARI_IZIN, MIN_ALASAN } from "@/lib/konfigurasi";
import { keDate, selisihHari, tanggalWIB, waktuWIB } from "@/lib/waktu";

const formatTanggal = /^\d{4}-\d{2}-\d{2}$/;
const formatJam = /^\d{2}:\d{2}$/;

const skemaIzin = z.object({
  jenis: z.enum(["IZIN", "SAKIT"], { message: "Pilih jenis pengajuan." }),
  mulai: z.string().regex(formatTanggal, "Pilih tanggal mulai."),
  selesai: z.string().regex(formatTanggal, "Pilih tanggal selesai."),
  alasan: z.string().trim().min(MIN_ALASAN, `Alasan minimal ${MIN_ALASAN} karakter.`).max(500),
});

export async function ajukanIzin(_sebelumnya: HasilAksi, formData: FormData): Promise<HasilAksi> {
  const peserta = await wajibPeran("PESERTA");
  const hasil = skemaIzin.safeParse({
    jenis: teks(formData, "jenis"),
    mulai: teks(formData, "mulai"),
    selesai: teks(formData, "selesai"),
    alasan: teks(formData, "alasan"),
  });
  if (!hasil.success) return gagal(hasil.error.issues[0].message);
  const { jenis, mulai, selesai, alasan } = hasil.data;
  const hariIni = tanggalWIB();

  if (selesai < mulai) return gagal("Tanggal selesai tidak boleh sebelum tanggal mulai.");
  if (selisihHari(mulai, selesai) + 1 > MAKS_HARI_IZIN) return gagal(`Satu pengajuan maksimal ${MAKS_HARI_IZIN} hari.`);
  if (selisihHari(mulai, hariIni) > BATAS_KOREKSI_HARI) return gagal(`Pengajuan paling lama ${BATAS_KOREKSI_HARI} hari ke belakang.`);

  // Dua rentang bertabrakan jika masing-masing mulai sebelum yang lain selesai.
  const bentrok = await db.pengajuanIzin.findFirst({
    where: {
      penggunaId: peserta.id,
      status: { in: ["MENUNGGU", "DISETUJUI"] },
      tanggalMulai: { lte: keDate(selesai) },
      tanggalSelesai: { gte: keDate(mulai) },
    },
  });
  if (bentrok) return gagal("Tanggal ini sudah ada di pengajuan lain yang menunggu atau disetujui.");

  await db.pengajuanIzin.create({
    data: { penggunaId: peserta.id, jenis, tanggalMulai: keDate(mulai), tanggalSelesai: keDate(selesai), alasan },
  });

  revalidatePath("/peserta", "layout");
  revalidatePath("/admin", "layout");
  return berhasil("Pengajuan terkirim. Kamu akan melihat keputusannya di halaman ini.");
}

export async function batalkanIzin(id: string): Promise<HasilAksi> {
  const peserta = await wajibPeran("PESERTA");
  // Hanya milik sendiri dan yang masih menunggu yang bisa dibatalkan.
  const { count } = await db.pengajuanIzin.deleteMany({ where: { id, penggunaId: peserta.id, status: "MENUNGGU" } });
  if (count === 0) return gagal("Pengajuan ini sudah diputuskan dan tidak bisa dibatalkan.");
  revalidatePath("/peserta", "layout");
  revalidatePath("/admin", "layout");
  return berhasil("Pengajuan dibatalkan.");
}

const skemaKoreksi = z.object({
  tanggal: z.string().regex(formatTanggal, "Pilih tanggal yang dikoreksi."),
  jamMasuk: z.string().regex(formatJam).or(z.literal("")),
  jamPulang: z.string().regex(formatJam).or(z.literal("")),
  alasan: z.string().trim().min(MIN_ALASAN, `Alasan minimal ${MIN_ALASAN} karakter.`).max(500),
});

export async function ajukanKoreksi(_sebelumnya: HasilAksi, formData: FormData): Promise<HasilAksi> {
  const peserta = await wajibPeran("PESERTA");
  const hasil = skemaKoreksi.safeParse({
    tanggal: teks(formData, "tanggal"),
    jamMasuk: teks(formData, "jamMasuk"),
    jamPulang: teks(formData, "jamPulang"),
    alasan: teks(formData, "alasan"),
  });
  if (!hasil.success) return gagal(hasil.error.issues[0].message);
  const { tanggal, jamMasuk, jamPulang, alasan } = hasil.data;
  const hariIni = tanggalWIB();

  // Hari ini tidak perlu dikoreksi: peserta masih bisa check-out sendiri.
  if (tanggal >= hariIni) return gagal("Koreksi hanya untuk tanggal yang sudah lewat.");
  if (selisihHari(tanggal, hariIni) > BATAS_KOREKSI_HARI) return gagal(`Koreksi paling lama ${BATAS_KOREKSI_HARI} hari ke belakang.`);

  const absensi = await db.absensi.findUnique({
    where: { penggunaId_tanggal: { penggunaId: peserta.id, tanggal: keDate(tanggal) } },
  });

  // Lupa check-in: kedua jam wajib. Lupa check-out: cukup jam pulang.
  if (!absensi && (!jamMasuk || !jamPulang)) return gagal("Tidak ada absensi di tanggal ini, jadi isi jam masuk dan jam pulang.");
  if (absensi && !jamMasuk && !jamPulang) return gagal("Isi jam yang ingin dikoreksi.");

  const masuk = jamMasuk ? waktuWIB(tanggal, jamMasuk) : absensi!.jamMasuk;
  const pulang = jamPulang ? waktuWIB(tanggal, jamPulang) : absensi?.jamPulang ?? null;
  if (pulang && pulang <= masuk) return gagal("Jam pulang harus setelah jam masuk.");

  try {
    await db.pengajuanKoreksi.create({
      data: {
        penggunaId: peserta.id,
        tanggal: keDate(tanggal),
        jamMasukUsulan: jamMasuk ? masuk : null,
        jamPulangUsulan: jamPulang ? pulang : null,
        alasan,
      },
    });
  } catch (e) {
    // Index unik sebagian di database: satu koreksi menunggu per tanggal.
    if (melanggarUnik(e)) return gagal("Masih ada koreksi yang menunggu untuk tanggal ini.");
    throw e;
  }

  revalidatePath("/peserta", "layout");
  revalidatePath("/admin", "layout");
  return berhasil("Koreksi terkirim dan menunggu persetujuan admin.");
}

export async function batalkanKoreksi(id: string): Promise<HasilAksi> {
  const peserta = await wajibPeran("PESERTA");
  const { count } = await db.pengajuanKoreksi.deleteMany({ where: { id, penggunaId: peserta.id, status: "MENUNGGU" } });
  if (count === 0) return gagal("Koreksi ini sudah diputuskan dan tidak bisa dibatalkan.");
  revalidatePath("/peserta", "layout");
  revalidatePath("/admin", "layout");
  return berhasil("Koreksi dibatalkan.");
}
