import { cn } from "@/lib/utils";
import { INFO_STATUS, type KodeStatus } from "@/lib/status";
import { akhirBulan, hariDalamMinggu, rentangTanggal, type Tanggal } from "@/lib/waktu";
import { VAR_WARNA } from "./status";

const NAMA_HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

// Semakin lama terlambat, semakin pekat warnanya. Satu skala warna, bukan warna baru.
function kepekatan(kode: KodeStatus, menitTerlambat = 0) {
  if (kode !== "TERLAMBAT") return 16;
  return Math.min(48, 16 + Math.round(menitTerlambat / 2));
}

export function KalenderKehadiran({
  bulan,
  status,
  terlambat,
  hariIni,
  className,
}: {
  bulan: Tanggal; // tanggal pertama bulan
  status: Record<Tanggal, KodeStatus>;
  terlambat?: Record<Tanggal, number>;
  hariIni: Tanggal;
  className?: string;
}) {
  const tanggal = rentangTanggal(bulan, akhirBulan(bulan));
  // Kalender dimulai hari Senin: Minggu (0) menjadi kolom ke-7.
  const geser = (hariDalamMinggu(bulan) + 6) % 7;

  return (
    <div className={className}>
      <div className="grid grid-cols-7 gap-1 text-center">
        {NAMA_HARI.map((h) => (
          <span key={h} className="pb-1 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            {h}
          </span>
        ))}
        {Array.from({ length: geser }, (_, i) => (
          <span key={`kosong-${i}`} />
        ))}
        {tanggal.map((t) => {
          const kode = status[t] ?? "DI_LUAR_PERIODE";
          const info = INFO_STATUS[kode];
          // Hari ini yang belum selesai tetap diwarnai sesuai jam masuknya.
          const kodeWarna = kode === "SEDANG_BEKERJA" && terlambat?.[t] ? "TERLAMBAT" : kode;
          const berwarna = kode !== "DI_LUAR_PERIODE" && kode !== "LIBUR" && kode !== "BELUM_ABSEN";
          const warna = VAR_WARNA[INFO_STATUS[kodeWarna].nada];
          return (
            <span
              key={t}
              title={`${Number(t.slice(8))}: ${info.label}`}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-md text-sm tabular-nums",
                !berwarna && "text-muted-foreground",
                t === hariIni && "ring-2 ring-foreground/70 ring-inset",
              )}
              style={berwarna ? { backgroundColor: `color-mix(in srgb, ${warna} ${kepekatan(kodeWarna, terlambat?.[t])}%, transparent)` } : undefined}
            >
              {Number(t.slice(8))}
              {berwarna && <span className="absolute inset-x-2 bottom-1 h-[3px] rounded-full" style={{ backgroundColor: warna }} aria-hidden />}
              <span className="sr-only">{info.label}</span>
            </span>
          );
        })}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        {(["TEPAT_WAKTU", "TERLAMBAT", "IZIN", "SAKIT", "ALPA", "TIDAK_CHECKOUT"] as const).map((k) => (
          <li key={k} className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ backgroundColor: VAR_WARNA[INFO_STATUS[k].nada] }} aria-hidden />
            {INFO_STATUS[k].label}
          </li>
        ))}
      </ul>
    </div>
  );
}
