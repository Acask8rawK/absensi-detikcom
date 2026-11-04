import { CalendarDaysIcon, ClockIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Kolom tanggal dan jam yang tampil sama di semua browser.
// iPhone tidak menampilkan ikon kalender bawaan dan memberi kolom tanggal lebar
// minimum sendiri, jadi ikonnya kita pasang sendiri dan lebarnya diatur di CSS
// (kelas .input-waktu di globals.css).

type Props = Omit<React.ComponentProps<typeof Input>, "type">;

function KolomWaktu({ type, ikon: Ikon, className, ...props }: Props & { type: "date" | "time"; ikon: typeof ClockIcon }) {
  return (
    <div className="relative min-w-0">
      <Input type={type} className={cn("input-waktu pr-9", className)} {...props} />
      <Ikon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
    </div>
  );
}

export function InputTanggal(props: Props) {
  return <KolomWaktu type="date" ikon={CalendarDaysIcon} {...props} />;
}

export function InputJam(props: Props) {
  return <KolomWaktu type="time" ikon={ClockIcon} {...props} />;
}
