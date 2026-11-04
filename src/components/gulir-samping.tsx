"use client";

import { useEffect, useRef, useState } from "react";
import { MoveHorizontalIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pembungkus tabel lebar. Di layar sempit tabel bisa digeser ke samping, dan
 * petunjuk "geser" hanya muncul kalau tabelnya memang lebih lebar dari layar.
 */
export function GulirSamping({ children, className }: { children: React.ReactNode; className?: string }) {
  const bingkai = useRef<HTMLDivElement>(null);
  const [meluap, setMeluap] = useState(false);

  useEffect(() => {
    const el = bingkai.current;
    if (!el) return;
    // ResizeObserver langsung terpanggil sekali saat mulai diamati,
    // lalu setiap kali lebar layar atau isi tabel berubah.
    const pengamat = new ResizeObserver(() => setMeluap(el.scrollWidth > el.clientWidth + 1));
    pengamat.observe(el);
    return () => pengamat.disconnect();
  }, []);

  return (
    <div className="min-w-0">
      {meluap && (
        <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MoveHorizontalIcon className="size-3.5" aria-hidden />
          Geser tabel ke samping untuk melihat kolom lainnya
        </p>
      )}
      <div ref={bingkai} className={cn("gulir-x", className)}>
        {children}
      </div>
    </div>
  );
}
