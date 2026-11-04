"use client";

import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/**
 * Jam berjalan yang mengikuti waktu server, bukan jam HP. Selisih antara jam
 * server dan jam perangkat dihitung sekali saat halaman dibuka, lalu dipakai
 * untuk setiap detik berikutnya.
 */
export function JamLangsung({ waktuServer, className }: { waktuServer: number; className?: string }) {
  const [selisih] = useState(() => waktuServer - Date.now());
  const [sekarang, setSekarang] = useState(waktuServer);

  useEffect(() => {
    const id = setInterval(() => setSekarang(Date.now() + selisih), 1000);
    return () => clearInterval(id);
  }, [selisih]);

  return (
    <time suppressHydrationWarning className={className}>
      {fmt.format(sekarang)}
    </time>
  );
}
