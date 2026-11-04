"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { berhasil, gagal, melanggarUnik, teks, type HasilAksi } from "@/lib/aksi";
import { wajibPeran } from "@/lib/auth";
import { db } from "@/lib/db";
import { MIN_LOGBOOK } from "@/lib/konfigurasi";
import { durasiMenit, formatDurasi, formatJam, keDate, statusDariJamMasuk, tanggalWIB } from "@/lib/waktu";

export async function checkIn(): Promise<HasilAksi> {
  const peserta = await wajibPeran("PESERTA");

  // Jam dan tanggal selalu dari server. Jam di HP peserta bisa salah atau diubah.
  const sekarang = new Date();
  const tanggal = tanggalWIB(sekarang);
  const { statusMasuk, menitTerlambat } = statusDariJamMasuk(sekarang, tanggal);

  try {
    await db.absensi.create({
      data: { penggunaId: peserta.id, tanggal: keDate(tanggal), jamMasuk: sekarang, statusMasuk, menitTerlambat },
    });
  } catch (e) {
    // Constraint unik (pengguna_id, tanggal) menolak check-in kedua di hari yang sama,
    // termasuk dua klik yang hampir bersamaan.
    if (melanggarUnik(e)) return gagal("Kamu sudah check-in hari ini.");
    throw e;
  }

  revalidatePath("/peserta");
  const keterangan = statusMasuk === "TERLAMBAT" ? ` Terlambat ${formatDurasi(menitTerlambat)}.` : "";
  return berhasil(`Check-in berhasil pukul ${formatJam(sekarang)}.${keterangan}`);
}

const skemaCheckOut = z.object({
  logbook: z.string().trim().min(MIN_LOGBOOK, `Tulis minimal ${MIN_LOGBOOK} karakter tentang pekerjaanmu hari ini.`).max(1000, "Logbook maksimal 1.000 karakter."),
});

export async function checkOut(_sebelumnya: HasilAksi, formData: FormData): Promise<HasilAksi> {
  const peserta = await wajibPeran("PESERTA");
  const hasil = skemaCheckOut.safeParse({ logbook: teks(formData, "logbook") });
  if (!hasil.success) return gagal(hasil.error.issues[0].message);

  const sekarang = new Date();
  const tanggal = keDate(tanggalWIB(sekarang));

  // Syarat "sudah check-in dan belum check-out" ditulis di WHERE, jadi pengecekan
  // dan perubahan terjadi dalam satu perintah tanpa celah di antaranya.
  const { count } = await db.absensi.updateMany({
    where: { penggunaId: peserta.id, tanggal, jamPulang: null },
    data: { jamPulang: sekarang, logbook: hasil.data.logbook },
  });
  if (count === 0) return gagal("Kamu belum check-in hari ini, atau sudah check-out.");

  const absensi = await db.absensi.findUniqueOrThrow({
    where: { penggunaId_tanggal: { penggunaId: peserta.id, tanggal } },
    select: { jamMasuk: true },
  });

  revalidatePath("/peserta");
  return berhasil(`Check-out berhasil. Kamu bekerja ${formatDurasi(durasiMenit(absensi.jamMasuk, sekarang))} hari ini.`);
}
