import type { Metadata } from "next";
import { wajibPeran } from "@/lib/auth";
import { HalamanProfil } from "@/components/halaman-profil";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilPeserta() {
  const peserta = await wajibPeran("PESERTA");
  return <HalamanProfil pengguna={peserta} />;
}
