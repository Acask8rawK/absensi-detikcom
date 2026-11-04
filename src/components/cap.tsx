import { cn } from "@/lib/utils";

// Cap stempel: tanda bahwa sebuah keputusan admin sudah diambil.
// Versi besar untuk kartu pengajuan, versi kecil untuk baris tabel.

type JenisCap = "DISETUJUI" | "DITOLAK" | "DIKOREKSI";

export function Cap({
  jenis,
  keterangan,
  mendarat = false,
  className,
}: {
  jenis: JenisCap;
  /** Baris kecil di bawah, misalnya "05.11 · AD" (tanggal dan inisial admin). */
  keterangan?: string;
  /** Animasi mendarat, dipakai tepat setelah admin memutuskan. */
  mendarat?: boolean;
  className?: string;
}) {
  const tolak = jenis === "DITOLAK";
  return (
    <span
      role="img"
      aria-label={`Cap ${jenis.toLowerCase()}${keterangan ? `, ${keterangan}` : ""}`}
      className={cn(
        "inline-grid size-[76px] shrink-0 -rotate-9 place-items-center rounded-full border-[2.5px] text-center opacity-90 select-none",
        tolak ? "border-cap-tolak text-cap-tolak" : "border-cap text-cap",
        mendarat && "cap-mendarat",
        className,
      )}
    >
      <span className="flex flex-col items-center leading-tight">
        <span className="text-[10px] font-bold tracking-[0.08em]">{jenis}</span>
        {keterangan && <span className="mt-0.5 text-[10px] font-medium tabular-nums">{keterangan}</span>}
      </span>
    </span>
  );
}

export function CapKecil({ jenis, className }: { jenis: JenisCap; className?: string }) {
  const tolak = jenis === "DITOLAK";
  return (
    <span
      className={cn(
        "inline-block -rotate-3 rounded-sm border-[1.5px] px-1.5 py-px text-[10px] font-bold tracking-[0.08em]",
        tolak ? "border-cap-tolak text-cap-tolak" : "border-cap text-cap",
        className,
      )}
    >
      {jenis}
    </span>
  );
}
