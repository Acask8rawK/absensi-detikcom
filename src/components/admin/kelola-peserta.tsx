"use client";

import { useActionState, useState, useTransition } from "react";
import { CopyIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { tambahPeserta, ubahStatusPeserta } from "@/actions/admin";
import { Kolom, PesanGalat, pertahankanIsian, TombolKirim } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputTanggal } from "@/components/input-waktu";
import { Input } from "@/components/ui/input";

export function TambahPeserta({ hariIni }: { hariIni: string }) {
  const [buka, setBuka] = useState(false);
  // Setiap kali dialog dibuka, isinya dibuat ulang (key berubah), jadi form kembali
  // kosong dan kata sandi sementara yang lalu tidak muncul lagi.
  const [urutan, setUrutan] = useState(0);

  return (
    <>
      <Button
        onClick={() => {
          setUrutan((n) => n + 1);
          setBuka(true);
        }}
        className="h-9"
      >
        <PlusIcon /> Tambah peserta
      </Button>
      <Dialog open={buka} onOpenChange={setBuka}>
        <DialogContent className="sm:max-w-md">
          <IsiTambahPeserta key={urutan} hariIni={hariIni} tutup={() => setBuka(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function IsiTambahPeserta({ hariIni, tutup }: { hariIni: string; tutup: () => void }) {
  const [hasil, aksi] = useActionState(pertahankanIsian(tambahPeserta), null);
  const isian = hasil?.isian ?? {};
  // Setelah berhasil, dialog berganti menampilkan kata sandi sementara.
  const berhasil = hasil?.ok && hasil.data;

  return berhasil ? (
    <>
      <DialogHeader>
        <DialogTitle>{hasil.pesan}</DialogTitle>
        <DialogDescription>
          Berikan kata sandi sementara ini ke peserta. Kata sandi hanya ditampilkan sekali dan wajib diganti saat login pertama.
        </DialogDescription>
      </DialogHeader>
      <dl className="grid gap-2 rounded-lg border p-3 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="font-medium">{berhasil.email}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Kata sandi sementara</dt>
          <dd className="flex items-center gap-1 font-mono font-semibold">
            {berhasil.sandi}
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Salin kata sandi"
              onClick={() =>
                navigator.clipboard.writeText(berhasil.sandi).then(
                  () => toast.success("Kata sandi disalin."),
                  () => toast.error("Gagal menyalin. Salin manual."),
                )
              }
            >
              <CopyIcon />
            </Button>
          </dd>
        </div>
      </dl>
      <Button onClick={tutup}>Selesai</Button>
    </>
  ) : (
    <>
      <DialogHeader>
        <DialogTitle>Tambah peserta</DialogTitle>
        <DialogDescription>Akun dibuat dengan kata sandi sementara. Tidak ada pendaftaran mandiri.</DialogDescription>
      </DialogHeader>
      <form action={aksi} className="grid gap-3.5">
        <Kolom label="Nama lengkap" htmlFor="nama">
          <Input id="nama" name="nama" defaultValue={isian.nama} required className="h-10" />
        </Kolom>
        <Kolom label="Email" htmlFor="email-baru">
          <Input id="email-baru" name="email" type="email" defaultValue={isian.email} required className="h-10" />
        </Kolom>
        <div className="grid grid-cols-2 gap-3">
          <Kolom label="Kampus" htmlFor="kampus">
            <Input id="kampus" name="kampus" defaultValue={isian.kampus} required className="h-10" />
          </Kolom>
          <Kolom label="Role" htmlFor="role">
            <Input id="role" name="role" defaultValue={isian.role} className="h-10" />
          </Kolom>
        </div>
        <Kolom label="Mulai magang" htmlFor="tanggalMulai">
          <InputTanggal id="tanggalMulai" name="tanggalMulai" defaultValue={isian.tanggalMulai ?? hariIni} required className="h-10" />
        </Kolom>
        <PesanGalat hasil={hasil} />
        <TombolKirim className="h-10">Simpan peserta</TombolKirim>
      </form>
    </>
  );
}

/** Nonaktifkan butuh dua langkah, supaya tidak terjadi karena salah klik. */
export function TombolStatusPeserta({ id, aktif, nama }: { id: string; aktif: boolean; nama: string }) {
  const [yakin, setYakin] = useState(false);
  const [sedang, mulai] = useTransition();
  const ubah = () =>
    mulai(async () => {
      const hasil = await ubahStatusPeserta(id, !aktif);
      if (hasil?.ok) toast.success(hasil.pesan);
      else if (hasil) toast.error(hasil.pesan);
      setYakin(false);
    });

  if (!aktif) {
    return (
      <Button size="sm" variant="outline" disabled={sedang} onClick={ubah}>
        Aktifkan
      </Button>
    );
  }
  if (!yakin) {
    return (
      <Button size="sm" variant="ghost" onClick={() => setYakin(true)}>
        Nonaktifkan
      </Button>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{nama.split(" ")[0]} tidak bisa login lagi.</span>
      <Button size="sm" variant="destructive" disabled={sedang} onClick={ubah}>
        Ya
      </Button>
      <Button size="sm" variant="ghost" disabled={sedang} onClick={() => setYakin(false)}>
        Batal
      </Button>
    </span>
  );
}
