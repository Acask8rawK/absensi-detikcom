import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "./db";
import { bacaToken, buatToken, NAMA_COOKIE, UMUR_SESI_DETIK, type IsiSesi } from "./sesi";

export async function simpanSesi(isi: IsiSesi) {
  const token = await buatToken(isi);
  const toko = await cookies();
  toko.set(NAMA_COOKIE, token, {
    httpOnly: true, // tidak bisa dibaca JavaScript di browser
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: UMUR_SESI_DETIK,
  });
}

export async function hapusSesi() {
  const toko = await cookies();
  toko.delete(NAMA_COOKIE);
}

export async function sesiSekarang() {
  const toko = await cookies();
  return bacaToken(toko.get(NAMA_COOKIE)?.value);
}

/**
 * Lapis kedua pemeriksaan akses. proxy.ts sudah memeriksa token, tetapi token
 * tidak bisa dicabut sebelum kedaluwarsa. Di sini pengguna dibaca ulang dari
 * database, jadi akun yang baru dinonaktifkan atau perannya berubah langsung ditolak.
 * Dibungkus cache() supaya dalam satu request database hanya ditanya sekali.
 */
export const wajibPeran = cache(async (peran: IsiSesi["peran"]) => {
  const sesi = await sesiSekarang();
  if (!sesi) redirect("/login");

  const pengguna = await db.pengguna.findUnique({
    where: { id: sesi.id },
    select: { id: true, nama: true, email: true, peran: true, aktif: true, kampus: true, role: true, tanggalMulai: true, wajibGantiSandi: true, akunDemo: true },
  });
  // Halaman tidak boleh menghapus cookie, jadi pengguna yang ditolak dikirim ke
  // /keluar (route handler) yang menghapus sesinya lalu membuka halaman login.
  if (!pengguna) redirect("/keluar?alasan=sesi");
  if (!pengguna.aktif) redirect("/keluar?alasan=nonaktif");
  if (pengguna.peran !== peran) redirect(pengguna.peran === "ADMIN" ? "/admin" : "/peserta");
  if (pengguna.wajibGantiSandi) redirect("/ganti-kata-sandi");
  return pengguna;
});
