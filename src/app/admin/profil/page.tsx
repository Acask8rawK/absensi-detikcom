import type { Metadata } from "next";
import { wajibPeran } from "@/lib/auth";
import { HalamanProfil } from "@/components/halaman-profil";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilAdmin() {
  const admin = await wajibPeran("ADMIN");
  return <HalamanProfil pengguna={admin} />;
}
