import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatBulan, tambahHari, type Tanggal } from "@/lib/waktu";
import { cn } from "@/lib/utils";

/** Tombol bulan sebelumnya / berikutnya. Bulan setelah bulan ini tidak bisa dibuka. */
export function NavigasiBulan({ bulan, hariIni, buatHref }: { bulan: Tanggal; hariIni: Tanggal; buatHref: (bulan: string) => string }) {
  const sebelumnya = tambahHari(bulan, -1).slice(0, 7);
  const berikutnya = tambahHari(bulan, 32).slice(0, 7);
  const bisaMaju = berikutnya <= hariIni.slice(0, 7);
  return (
    <div className="flex items-center gap-1">
      <Link href={buatHref(sebelumnya)} className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Bulan sebelumnya">
        <ChevronLeftIcon />
      </Link>
      <span className="min-w-32 text-center text-sm font-semibold">{formatBulan(bulan)}</span>
      {bisaMaju ? (
        <Link href={buatHref(berikutnya)} className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Bulan berikutnya">
          <ChevronRightIcon />
        </Link>
      ) : (
        <span className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "pointer-events-none opacity-30")} aria-hidden>
          <ChevronRightIcon />
        </span>
      )}
    </div>
  );
}

/** Membaca ?bulan=YYYY-MM dengan aman; nilai tidak valid jatuh ke bulan ini. */
export function bacaBulan(nilai: unknown, hariIni: Tanggal): Tanggal {
  if (typeof nilai === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(nilai) && nilai <= hariIni.slice(0, 7)) return `${nilai}-01`;
  return `${hariIni.slice(0, 7)}-01`;
}
