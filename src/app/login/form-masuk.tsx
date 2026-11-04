"use client";

import { useActionState, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { masuk } from "@/actions/auth";
import { Kolom, PesanGalat, pertahankanIsian, TombolKirim } from "@/components/form";
import { Input } from "@/components/ui/input";

export function FormMasuk() {
  const [hasil, aksi] = useActionState(pertahankanIsian(masuk), null);
  const [lihat, setLihat] = useState(false);

  return (
    <form action={aksi} className="grid gap-4" noValidate>
      <Kolom label="Email" htmlFor="email">
        <Input id="email" name="email" defaultValue={hasil?.isian?.email} type="email" autoComplete="email" inputMode="email" required className="h-10" />
      </Kolom>
      <Kolom label="Kata sandi" htmlFor="kataSandi">
        <div className="relative">
          <Input id="kataSandi" name="kataSandi" type={lihat ? "text" : "password"} autoComplete="current-password" required className="h-10 pr-10" />
          <button
            type="button"
            onClick={() => setLihat((x) => !x)}
            className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted-foreground hover:text-foreground"
            aria-label={lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          >
            {lihat ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        </div>
      </Kolom>
      <PesanGalat hasil={hasil} />
      <TombolKirim className="h-10" teksProses="Memeriksa…">
        Masuk
      </TombolKirim>
    </form>
  );
}
