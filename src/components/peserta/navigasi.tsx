"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDaysIcon, FileTextIcon, HouseIcon, UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const MENU = [
  { href: "/peserta", label: "Beranda", ikon: HouseIcon },
  { href: "/peserta/riwayat", label: "Riwayat", ikon: CalendarDaysIcon },
  { href: "/peserta/pengajuan", label: "Pengajuan", ikon: FileTextIcon },
  { href: "/peserta/profil", label: "Profil", ikon: UserIcon },
];

export function NavigasiPeserta({ menunggu }: { menunggu: number }) {
  const path = usePathname();
  return (
    <nav
      aria-label="Menu peserta"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:sticky md:top-0 md:bottom-auto md:border-t-0 md:border-b md:pb-0"
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-4">
        {MENU.map(({ href, label, ikon: Ikon }) => {
          const aktif = href === "/peserta" ? path === href : path.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={aktif ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors md:flex-row md:justify-center md:gap-2 md:text-sm",
                  aktif && "text-primary",
                )}
              >
                <Ikon className="size-5 md:size-4" strokeWidth={aktif ? 2.25 : 1.75} />
                {label}
                {href === "/peserta/pengajuan" && menunggu > 0 && (
                  <span className="absolute top-1.5 left-1/2 ml-2.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground md:static md:ml-0">
                    {menunggu}
                  </span>
                )}
                {aktif && <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-primary md:top-auto md:bottom-0" aria-hidden />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
