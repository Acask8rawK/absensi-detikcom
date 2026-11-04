"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { gagal, teks, type HasilAksi } from "@/lib/aksi";
import { hapusSesi, sesiSekarang, simpanSesi } from "@/lib/auth";
import { db } from "@/lib/db";
import { MIN_KATA_SANDI } from "@/lib/konfigurasi";
import { berandaUntuk } from "@/lib/sesi";

const skemaMasuk = z.object({
  email: z.string().trim().toLowerCase().email("Format email belum benar."),
  kataSandi: z.string().min(1, "Kata sandi wajib diisi."),
});

// Hash palsu dipakai saat email tidak ditemukan, supaya lama prosesnya sama
// dengan email yang terdaftar. Tanpa ini, waktu respons bisa membocorkan email mana yang ada.
const HASH_PALSU = bcrypt.hashSync("bukan-kata-sandi-siapa-pun", 10);

export async function masuk(_sebelumnya: HasilAksi, formData: FormData): Promise<HasilAksi> {
  const hasil = skemaMasuk.safeParse({ email: teks(formData, "email"), kataSandi: teks(formData, "kataSandi") });
  if (!hasil.success) return gagal(hasil.error.issues[0].message);

  const pengguna = await db.pengguna.findUnique({ where: { email: hasil.data.email } });
  const cocok = await bcrypt.compare(hasil.data.kataSandi, pengguna?.kataSandiHash ?? HASH_PALSU);

  // Satu pesan untuk semua kegagalan: orang lain tidak bisa menebak email mana yang terdaftar.
  if (!pengguna || !cocok || !pengguna.aktif) return gagal("Email atau kata sandi salah.");

  await simpanSesi({ id: pengguna.id, peran: pengguna.peran, gantiSandi: pengguna.wajibGantiSandi });
  redirect(pengguna.wajibGantiSandi ? "/ganti-kata-sandi" : berandaUntuk(pengguna.peran));
}

export async function masukDemo(peran: "ADMIN" | "PESERTA") {
  // Hanya akun yang ditandai akun_demo di database yang bisa dimasuki tanpa kata sandi.
  const pengguna = await db.pengguna.findFirst({
    where: { akunDemo: true, peran, aktif: true },
    orderBy: { dibuatPada: "asc" },
  });
  if (!pengguna) redirect("/login?pesan=demo");

  await simpanSesi({ id: pengguna.id, peran: pengguna.peran, gantiSandi: false });
  redirect(berandaUntuk(pengguna.peran));
}

export async function keluar() {
  await hapusSesi();
  redirect("/login");
}

const skemaGantiSandi = z
  .object({
    lama: z.string().min(1, "Isi kata sandi saat ini."),
    baru: z.string().min(MIN_KATA_SANDI, `Kata sandi baru minimal ${MIN_KATA_SANDI} karakter.`),
    ulangi: z.string(),
  })
  .refine((d) => d.baru === d.ulangi, { message: "Ulangi kata sandi baru belum sama.", path: ["ulangi"] })
  .refine((d) => d.baru !== d.lama, { message: "Kata sandi baru harus berbeda dari yang lama.", path: ["baru"] });

export async function gantiKataSandi(_sebelumnya: HasilAksi, formData: FormData): Promise<HasilAksi> {
  const sesi = await sesiSekarang();
  if (!sesi) redirect("/login");

  const hasil = skemaGantiSandi.safeParse({
    lama: teks(formData, "lama"),
    baru: teks(formData, "baru"),
    ulangi: teks(formData, "ulangi"),
  });
  if (!hasil.success) return gagal(hasil.error.issues[0].message);

  const pengguna = await db.pengguna.findUnique({ where: { id: sesi.id } });
  if (!pengguna || !pengguna.aktif) redirect("/keluar");
  if (pengguna.akunDemo) return gagal("Kata sandi akun demo tidak bisa diubah, supaya penguji lain tetap bisa masuk.");
  if (!(await bcrypt.compare(hasil.data.lama, pengguna.kataSandiHash))) return gagal("Kata sandi saat ini salah.");

  await db.pengguna.update({
    where: { id: pengguna.id },
    data: { kataSandiHash: await bcrypt.hash(hasil.data.baru, 10), wajibGantiSandi: false },
  });
  // Token lama masih membawa tanda "wajib ganti sandi", jadi diterbitkan ulang.
  await simpanSesi({ id: pengguna.id, peran: pengguna.peran, gantiSandi: false });
  redirect(`${berandaUntuk(pengguna.peran)}?pesan=sandi-diganti`);
}
