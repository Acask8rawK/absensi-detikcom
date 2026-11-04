"use client";

import { useActionState, useEffect, useState } from "react";
import { checkIn, checkOut } from "@/actions/absensi";
import { JamLangsung } from "@/components/jam-langsung";
import { BarDurasi, TulisanPeserta } from "@/components/rapor";
import { LencanaStatus } from "@/components/status";
import { pertahankanIsian, TombolKirim, useNotifikasiHasil } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { MIN_LOGBOOK } from "@/lib/konfigurasi";
import type { KodeStatus } from "@/lib/status";

type AbsensiKlien = {
  jamMasuk: string; // ISO
  jamPulang: string | null;
  statusMasuk: "TEPAT_WAKTU" | "TERLAMBAT" | "HARI_LIBUR";
  menitTerlambat: number;
  logbook: string | null;
};

const fmtJam = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

export function KartuHariIni({
  absensi,
  status,
  waktuServer,
  hariKerja,
}: {
  absensi: AbsensiKlien | null;
  status: KodeStatus;
  waktuServer: number;
  hariKerja: boolean;
}) {
  const [hasilMasuk, aksiMasuk] = useActionState(checkIn, null);
  useNotifikasiHasil(hasilMasuk);

  if (!absensi) {
    return (
      <section className="rounded-[10px] border bg-card p-5" aria-label="Absensi hari ini">
        <JamLangsung waktuServer={waktuServer} className="block text-5xl leading-none font-bold tracking-tight tabular-nums" />
        <p className="mt-2 text-sm text-muted-foreground">
          {hariKerja ? "Jam masuk 09.00 WIB, toleransi 15 menit." : "Hari ini libur. Kalau tetap masuk, absenmu tetap dicatat."}
        </p>
        {(status === "IZIN" || status === "SAKIT") && (
          <p className="mt-3 text-sm">
            Kamu tercatat <LencanaStatus kode={status} className="align-middle" /> hari ini. Check-in hanya kalau kamu tetap datang.
          </p>
        )}
        <form action={aksiMasuk} className="mt-5">
          <TombolKirim className="h-12 w-full text-base" teksProses="Mencatat jam…">
            Check-in sekarang
          </TombolKirim>
        </form>
        <p className="mt-3 text-xs text-muted-foreground">Jam diambil dari server, bukan dari jam HP-mu.</p>
      </section>
    );
  }

  return <KartuSudahMasuk absensi={absensi} />;
}

function KartuSudahMasuk({ absensi }: { absensi: AbsensiKlien }) {
  const masuk = new Date(absensi.jamMasuk);
  const pulang = absensi.jamPulang ? new Date(absensi.jamPulang) : null;
  const [buka, setBuka] = useState(false);
  const [hasilPulang, aksiPulang] = useActionState(pertahankanIsian(checkOut), null);
  useNotifikasiHasil(hasilPulang, () => setBuka(false));

  // Durasi berjalan diperbarui tiap 30 detik selama belum check-out.
  const sudahPulang = pulang !== null;
  const [sekarang, setSekarang] = useState(() => Date.now());
  useEffect(() => {
    if (sudahPulang) return;
    const id = setInterval(() => setSekarang(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [sudahPulang]);
  const menitKerja = Math.max(0, Math.round(((pulang?.getTime() ?? sekarang) - masuk.getTime()) / 60_000));

  return (
    <section className="rounded-[10px] border bg-card" aria-label="Absensi hari ini">
      <dl className="grid grid-cols-3 divide-x border-b text-center">
        <div className="px-2 py-4">
          <dt className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Masuk</dt>
          <dd className="mt-1 text-2xl font-bold tabular-nums">{fmtJam.format(masuk)}</dd>
        </div>
        <div className="px-2 py-4">
          <dt className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Pulang</dt>
          <dd className="mt-1 text-2xl font-bold tabular-nums">{pulang ? fmtJam.format(pulang) : "–"}</dd>
        </div>
        <div className="px-2 py-4">
          <dt className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Durasi</dt>
          <dd className="mt-1.5 text-base font-semibold">
            <BarDurasi menit={menitKerja} />
          </dd>
        </div>
      </dl>
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <LencanaStatus
          kode={absensi.statusMasuk === "HARI_LIBUR" ? "LEMBUR_LIBUR" : absensi.statusMasuk}
          menitTerlambat={absensi.menitTerlambat}
          className="text-sm"
        />
        {!pulang && (
          <Button size="lg" className="h-11 px-6" onClick={() => setBuka(true)}>
            Check-out
          </Button>
        )}
      </div>
      {pulang && absensi.logbook && (
        <div className="border-t px-5 py-4 text-sm">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Logbook hari ini</p>
          <TulisanPeserta className="mt-1 block leading-relaxed">{absensi.logbook}</TulisanPeserta>
          <p className="mt-3 text-xs text-muted-foreground">Absen hari ini sudah lengkap. Sampai besok.</p>
        </div>
      )}

      <Sheet open={buka} onOpenChange={setBuka}>
        <SheetContent side="bottom" className="mx-auto max-w-2xl rounded-t-xl">
          <SheetHeader>
            <SheetTitle>Check-out</SheetTitle>
            <SheetDescription>Tulis singkat apa yang kamu kerjakan hari ini. Mentor membaca logbook ini.</SheetDescription>
          </SheetHeader>
          <form action={aksiPulang} className="grid gap-3 px-4 pb-6">
            <label htmlFor="logbook" className="sr-only">
              Logbook hari ini
            </label>
            <Textarea
              id="logbook"
              name="logbook"
              defaultValue={hasilPulang?.isian?.logbook}
              rows={4}
              required
              minLength={MIN_LOGBOOK}
              maxLength={1000}
              placeholder="Contoh: merapikan tabel laporan dan menulis tes untuk fitur check-in."
              className="text-tinta-biru"
              autoFocus
            />
            {hasilPulang && !hasilPulang.ok && <p className="text-sm text-destructive">{hasilPulang.pesan}</p>}
            <TombolKirim className="h-11">Simpan dan check-out</TombolKirim>
          </form>
        </SheetContent>
      </Sheet>
    </section>
  );
}
