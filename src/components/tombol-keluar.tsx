import { LogOutIcon } from "lucide-react";
import { keluar } from "@/actions/auth";
import { Button } from "@/components/ui/button";

/** Tombol keluar berbentuk ikon, di bilah atas peserta dan di bawah sidebar admin. */
export function TombolKeluar({ className }: { className?: string }) {
  return (
    <form action={keluar}>
      <Button type="submit" variant="ghost" size="icon" className={className} aria-label="Keluar" title="Keluar">
        <LogOutIcon />
      </Button>
    </form>
  );
}
