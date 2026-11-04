import { cn } from "@/lib/utils";
import { JAM_KERJA_MENIT } from "@/lib/konfigurasi";
import { formatDurasi } from "@/lib/waktu";

// Potongan kecil yang dipinjam dari tata letak rapor: blok ketidakhadiran,
// angka dalam sel bergaris, dan kepala kolom berhuruf kapital.

export function KepalaKolom({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase", className)}>{children}</span>;
}

export function BlokKetidakhadiran({
  sakit,
  izin,
  alpa,
  tidakCheckout,
  className,
}: {
  sakit: number;
  izin: number;
  alpa: number;
  tidakCheckout?: number;
  className?: string;
}) {
  const baris: [string, number][] = [
    ["Sakit", sakit],
    ["Izin", izin],
    ["Tanpa keterangan", alpa],
  ];
  if (tidakCheckout !== undefined) baris.push(["Tidak check-out", tidakCheckout]);
  return (
    <table className={cn("w-full border-collapse text-sm", className)}>
      <tbody>
        {baris.map(([label, jumlah]) => (
          <tr key={label}>
            <td className="border border-border px-3 py-2">{label}</td>
            <td className="w-28 border border-border px-3 py-2 text-right tabular-nums">
              <span className="text-lg font-semibold">{jumlah}</span> <span className="text-muted-foreground">hari</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Angka-angka ringkas dalam satu baris tabel bergaris, bukan kartu-kartu terpisah. */
export function BarisAngka({ isi, className }: { isi: { label: string; nilai: React.ReactNode; catatan?: React.ReactNode }[]; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-2 overflow-hidden rounded-[10px] border bg-card md:grid-cols-4", className)}>
      {isi.map((x, i) => (
        <div key={x.label} className={cn("border-border px-4 py-3", i % 2 === 1 && "border-l", i >= 2 && "border-t md:border-t-0", i > 0 && "md:border-l")}>
          <dt>
            <KepalaKolom>{x.label}</KepalaKolom>
          </dt>
          <dd className="mt-1 text-3xl leading-none font-bold tabular-nums">{x.nilai}</dd>
          {x.catatan && <dd className="mt-1.5 truncate text-xs text-muted-foreground">{x.catatan}</dd>}
        </div>
      ))}
    </dl>
  );
}

/** Durasi kerja dibaca terhadap satu hari penuh (8 jam). */
export function BarDurasi({ menit, className }: { menit: number; className?: string }) {
  const persen = Math.min(100, Math.round((menit / JAM_KERJA_MENIT) * 100));
  return (
    <span className={cn("inline-flex items-center justify-end gap-2", className)}>
      <span className="hidden h-1 w-14 overflow-hidden rounded-full bg-muted sm:inline-block" aria-hidden>
        <span className="block h-full bg-primary/70" style={{ width: `${persen}%` }} />
      </span>
      <span className="whitespace-nowrap tabular-nums">{formatDurasi(menit)}</span>
    </span>
  );
}

export function Inisial({ nama, className }: { nama: string; className?: string }) {
  const huruf = nama
    .split(/\s+/)
    .slice(0, 2)
    .map((k) => k[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span aria-hidden className={cn("inline-grid size-8 shrink-0 place-items-center rounded-md border bg-secondary text-xs font-semibold", className)}>
      {huruf}
    </span>
  );
}

export function inisialDari(nama: string) {
  return nama
    .split(/\s+/)
    .slice(0, 2)
    .map((k) => k[0]?.toUpperCase() ?? "")
    .join("");
}

/** Teks yang ditulis peserta sendiri selalu berwarna tinta biru. */
export function TulisanPeserta({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("text-tinta-biru", className)}>{children}</span>;
}
