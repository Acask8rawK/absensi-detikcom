import {
  BriefcaseIcon,
  CheckIcon,
  ClockIcon,
  DoorOpenIcon,
  FileTextIcon,
  MinusIcon,
  StethoscopeIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDurasi } from "@/lib/waktu";
import { INFO_STATUS, type KodeStatus, type Nada } from "@/lib/status";

// Status selalu tampil sebagai ikon + teks + warna. Warna saja tidak cukup
// untuk pengguna buta warna, jadi teks tidak pernah dihilangkan.

const IKON: Record<KodeStatus, LucideIcon> = {
  TEPAT_WAKTU: CheckIcon,
  TERLAMBAT: ClockIcon,
  LEMBUR_LIBUR: BriefcaseIcon,
  SEDANG_BEKERJA: BriefcaseIcon,
  TIDAK_CHECKOUT: DoorOpenIcon,
  IZIN: FileTextIcon,
  SAKIT: StethoscopeIcon,
  ALPA: XIcon,
  BELUM_ABSEN: MinusIcon,
  LIBUR: MinusIcon,
  DI_LUAR_PERIODE: MinusIcon,
};

export const WARNA_TEKS: Record<Nada, string> = {
  tepat: "text-st-tepat",
  telat: "text-st-telat",
  izin: "text-st-izin",
  sakit: "text-st-sakit",
  alpa: "text-st-alpa",
  keluar: "text-st-keluar",
  libur: "text-muted-foreground",
};

export const VAR_WARNA: Record<Nada, string> = {
  tepat: "var(--st-tepat)",
  telat: "var(--st-telat)",
  izin: "var(--st-izin)",
  sakit: "var(--st-sakit)",
  alpa: "var(--st-alpa)",
  keluar: "var(--st-keluar)",
  libur: "var(--st-libur)",
};

export function LencanaStatus({
  kode,
  menitTerlambat,
  className,
}: {
  kode: KodeStatus;
  menitTerlambat?: number;
  className?: string;
}) {
  // Peserta yang datang terlambat dan belum pulang tetap ditampilkan terlambat,
  // bukan "sedang bekerja", supaya admin langsung melihatnya di tabel hari ini.
  const tampil = kode === "SEDANG_BEKERJA" && menitTerlambat ? "TERLAMBAT" : kode;
  const info = INFO_STATUS[tampil];
  const Ikon = IKON[tampil];
  const label = tampil === "TERLAMBAT" && menitTerlambat ? `Terlambat ${formatDurasi(menitTerlambat)}` : info.label;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap", WARNA_TEKS[info.nada], className)}>
      <Ikon className="size-3.5" strokeWidth={2.25} aria-hidden />
      {label}
    </span>
  );
}
