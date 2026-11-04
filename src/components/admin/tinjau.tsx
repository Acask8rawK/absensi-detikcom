"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { tinjauIzin, tinjauKoreksi } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/** Tombol Setujui / Tolak. Tolak membuka kolom alasan, karena penolakan wajib beralasan. */
export function TombolTinjau({ id, jenis }: { id: string; jenis: "izin" | "koreksi" }) {
  const [tolak, setTolak] = useState(false);
  const [catatan, setCatatan] = useState("");
  const [sedang, mulai] = useTransition();

  const putuskan = (keputusan: "DISETUJUI" | "DITOLAK") =>
    mulai(async () => {
      const aksi = jenis === "izin" ? tinjauIzin : tinjauKoreksi;
      const hasil = await aksi(id, keputusan, catatan);
      if (hasil?.ok) toast.success(hasil.pesan);
      else if (hasil) toast.error(hasil.pesan);
    });

  if (tolak) {
    return (
      <div className="grid gap-2">
        <label htmlFor={`catatan-${id}`} className="text-xs font-medium">
          Alasan penolakan
        </label>
        <Textarea
          id={`catatan-${id}`}
          rows={2}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Contoh: mohon lampirkan surat dokter."
          autoFocus
        />
        <div className="flex gap-2">
          <Button size="sm" variant="destructive" disabled={sedang} onClick={() => putuskan("DITOLAK")}>
            {sedang ? "Menyimpan…" : "Kirim penolakan"}
          </Button>
          <Button size="sm" variant="ghost" disabled={sedang} onClick={() => setTolak(false)}>
            Batal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" disabled={sedang} onClick={() => setTolak(true)}>
        Tolak
      </Button>
      <Button size="sm" disabled={sedang} onClick={() => putuskan("DISETUJUI")}>
        {sedang ? "Menyimpan…" : "Setujui"}
      </Button>
    </div>
  );
}
