import { redirect } from "next/navigation";
import { sesiSekarang } from "@/lib/auth";
import { berandaUntuk } from "@/lib/sesi";

// Halaman akar hanya mengarahkan: ke login, atau ke beranda sesuai peran.
export default async function Akar() {
  const sesi = await sesiSekarang();
  redirect(sesi ? berandaUntuk(sesi.peran) : "/login");
}
