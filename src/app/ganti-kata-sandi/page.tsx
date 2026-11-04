import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { sesiSekarang } from "@/lib/auth";
import { db } from "@/lib/db";
import { berandaUntuk } from "@/lib/sesi";
import { FormGantiSandi } from "@/components/form-ganti-sandi";

export const metadata: Metadata = { title: "Ganti kata sandi" };

export default async function HalamanGantiSandi() {
  const sesi = await sesiSekarang();
  if (!sesi) redirect("/login");
  const pengguna = await db.pengguna.findUnique({ where: { id: sesi.id }, select: { nama: true, wajibGantiSandi: true, peran: true } });
  if (!pengguna) redirect("/keluar");
  // Halaman ini khusus untuk login pertama. Ganti sandi biasa ada di menu Profil.
  if (!pengguna.wajibGantiSandi) redirect(berandaUntuk(pengguna.peran));

  return (
    <main className="grid flex-1 place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight">Buat kata sandi baru</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Halo, {pengguna.nama.split(" ")[0]}. Kamu masuk dengan kata sandi sementara dari admin. Ganti dulu dengan kata sandi milikmu sendiri.
        </p>
        <section className="mt-6 rounded-[10px] border bg-card p-5">
          <FormGantiSandi labelLama="Kata sandi sementara" />
        </section>
      </div>
    </main>
  );
}
