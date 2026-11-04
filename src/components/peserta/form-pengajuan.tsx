"use client";

import { useActionState, useRef, useTransition } from "react";
import { toast } from "sonner";
import { ajukanIzin, ajukanKoreksi, batalkanIzin, batalkanKoreksi } from "@/actions/pengajuan";
import { Kolom, PesanGalat, pertahankanIsian, TombolKirim, useNotifikasiHasil } from "@/components/form";
import { Button } from "@/components/ui/button";
import { InputJam, InputTanggal } from "@/components/input-waktu";
import { Textarea } from "@/components/ui/textarea";
import { MIN_ALASAN } from "@/lib/konfigurasi";

const pilihan = "h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function FormIzin({ hariIni, batasMundur }: { hariIni: string; batasMundur: string }) {
  const form = useRef<HTMLFormElement>(null);
  const [hasil, aksi] = useActionState(pertahankanIsian(ajukanIzin), null);
  useNotifikasiHasil(hasil, () => form.current?.reset());
  const isian = hasil?.isian ?? {};

  return (
    <form ref={form} action={aksi} className="grid gap-4">
      <Kolom label="Jenis" htmlFor="jenis">
        {/* key membuat select dibuat ulang, karena React tidak memperbarui defaultValue select yang sudah tampil. */}
        <select key={isian.jenis ?? "awal"} id="jenis" name="jenis" className={pilihan} defaultValue={isian.jenis ?? "IZIN"}>
          <option value="IZIN">Izin</option>
          <option value="SAKIT">Sakit</option>
        </select>
      </Kolom>
      <div className="grid grid-cols-2 gap-3">
        <Kolom label="Dari tanggal" htmlFor="mulai">
          <InputTanggal id="mulai" name="mulai" min={batasMundur} defaultValue={isian.mulai ?? hariIni} required className="h-10" />
        </Kolom>
        <Kolom label="Sampai tanggal" htmlFor="selesai">
          <InputTanggal id="selesai" name="selesai" min={batasMundur} defaultValue={isian.selesai ?? hariIni} required className="h-10" />
        </Kolom>
      </div>
      <Kolom label="Alasan" htmlFor="alasan-izin" petunjuk={`Minimal ${MIN_ALASAN} karakter. Admin membaca ini sebelum memutuskan.`}>
        <Textarea id="alasan-izin" name="alasan" defaultValue={isian.alasan} rows={3} required minLength={MIN_ALASAN} maxLength={500} className="text-tinta-biru" />
      </Kolom>
      <PesanGalat hasil={hasil} />
      <TombolKirim className="h-10">Kirim pengajuan</TombolKirim>
    </form>
  );
}

export function FormKoreksi({ tanggalAwal, batasMundur, kemarin }: { tanggalAwal: string; batasMundur: string; kemarin: string }) {
  const form = useRef<HTMLFormElement>(null);
  const [hasil, aksi] = useActionState(pertahankanIsian(ajukanKoreksi), null);
  useNotifikasiHasil(hasil, () => form.current?.reset());
  const isian = hasil?.isian ?? {};

  return (
    <form ref={form} action={aksi} className="grid gap-4">
      <Kolom label="Tanggal yang dikoreksi" htmlFor="tanggal-koreksi" petunjuk="Maksimal 7 hari ke belakang.">
        <InputTanggal id="tanggal-koreksi" name="tanggal" min={batasMundur} max={kemarin} defaultValue={isian.tanggal ?? tanggalAwal} required className="h-10" />
      </Kolom>
      <div className="grid grid-cols-2 gap-3">
        <Kolom label="Jam masuk" htmlFor="jamMasuk" petunjuk="Kosongkan jika sudah benar.">
          <InputJam id="jamMasuk" name="jamMasuk" defaultValue={isian.jamMasuk} className="h-10" />
        </Kolom>
        <Kolom label="Jam pulang" htmlFor="jamPulang" petunjuk="Isi jika lupa check-out.">
          <InputJam id="jamPulang" name="jamPulang" defaultValue={isian.jamPulang} className="h-10" />
        </Kolom>
      </div>
      <Kolom label="Alasan" htmlFor="alasan-koreksi" petunjuk={`Minimal ${MIN_ALASAN} karakter.`}>
        <Textarea id="alasan-koreksi" name="alasan" defaultValue={isian.alasan} rows={3} required minLength={MIN_ALASAN} maxLength={500} className="text-tinta-biru" />
      </Kolom>
      <PesanGalat hasil={hasil} />
      <TombolKirim className="h-10">Kirim koreksi</TombolKirim>
    </form>
  );
}

export function TombolBatal({ id, jenis }: { id: string; jenis: "izin" | "koreksi" }) {
  const [sedang, mulai] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={sedang}
      onClick={() =>
        mulai(async () => {
          const hasil = jenis === "izin" ? await batalkanIzin(id) : await batalkanKoreksi(id);
          if (hasil?.ok) toast.success(hasil.pesan);
          else if (hasil) toast.error(hasil.pesan);
        })
      }
    >
      {sedang ? "Membatalkan…" : "Batalkan"}
    </Button>
  );
}
