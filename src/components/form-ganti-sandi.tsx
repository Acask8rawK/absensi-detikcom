"use client";

import { useActionState } from "react";
import { gantiKataSandi } from "@/actions/auth";
import { Kolom, PesanGalat, TombolKirim } from "@/components/form";
import { Input } from "@/components/ui/input";
import { MIN_KATA_SANDI } from "@/lib/konfigurasi";

export function FormGantiSandi({ labelLama = "Kata sandi saat ini" }: { labelLama?: string }) {
  const [hasil, aksi] = useActionState(gantiKataSandi, null);
  return (
    <form action={aksi} className="grid gap-4">
      <Kolom label={labelLama} htmlFor="lama">
        <Input id="lama" name="lama" type="password" autoComplete="current-password" required className="h-10" />
      </Kolom>
      <Kolom label="Kata sandi baru" htmlFor="baru" petunjuk={`Minimal ${MIN_KATA_SANDI} karakter.`}>
        <Input id="baru" name="baru" type="password" autoComplete="new-password" required minLength={MIN_KATA_SANDI} className="h-10" />
      </Kolom>
      <Kolom label="Ulangi kata sandi baru" htmlFor="ulangi">
        <Input id="ulangi" name="ulangi" type="password" autoComplete="new-password" required className="h-10" />
      </Kolom>
      <PesanGalat hasil={hasil} />
      <TombolKirim className="h-10">Simpan kata sandi</TombolKirim>
    </form>
  );
}
