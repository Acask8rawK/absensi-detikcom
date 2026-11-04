"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheckIcon, FileBarChartIcon, LayoutDashboardIcon, MenuIcon, UserIcon, UsersIcon } from "lucide-react";
import { TombolKeluar } from "@/components/tombol-keluar";
import { TombolTema } from "@/components/tema";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const MENU = [
  { href: "/admin", label: "Dashboard", ikon: LayoutDashboardIcon },
  { href: "/admin/peserta", label: "Peserta", ikon: UsersIcon },
  { href: "/admin/laporan", label: "Laporan", ikon: FileBarChartIcon },
  { href: "/admin/persetujuan", label: "Persetujuan", ikon: ClipboardCheckIcon },
  { href: "/admin/profil", label: "Profil", ikon: UserIcon },
];

function DaftarMenu({ menunggu, onPilih }: { menunggu: number; onPilih?: () => void }) {
  const path = usePathname();
  return (
    <ul className="grid gap-0.5">
      {MENU.map(({ href, label, ikon: Ikon }) => {
        const aktif = href === "/admin" ? path === href : path.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onPilih}
              aria-current={aktif ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-sampul-teks/85 transition-colors hover:bg-sampul-aktif hover:text-white",
                aktif && "bg-sampul-aktif text-white",
              )}
            >
              <Ikon className="size-4" strokeWidth={aktif ? 2.25 : 1.75} />
              <span className="flex-1">{label}</span>
              {href === "/admin/persetujuan" && menunggu > 0 && (
                <span className="rounded-full bg-sampul-teks px-1.5 text-xs font-bold text-sampul tabular-nums">{menunggu}</span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Merek() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-md bg-sampul-teks text-sm font-bold text-sampul" aria-hidden>
        H
      </span>
      <span>
        <span className="block leading-none font-bold tracking-tight">Hadir</span>
        <span className="mt-1 block text-[10px] font-semibold tracking-[0.12em] uppercase opacity-70">Absensi magang</span>
      </span>
    </span>
  );
}

const IKON_DI_SAMPUL = "size-9 text-sampul-teks hover:bg-sampul-aktif hover:text-white dark:hover:bg-sampul-aktif";

/** Bagian bawah sidebar: siapa yang masuk, lalu tombol tema dan keluar di kanannya. */
function KakiRel({ nama }: { nama: string }) {
  return (
    <div className="mt-auto flex items-center gap-1 border-t border-sidebar-border pt-4">
      <p className="min-w-0 flex-1 text-xs">
        <span className="opacity-80">Masuk sebagai</span>
        <span className="mt-0.5 block truncate text-sm font-semibold">{nama}</span>
      </p>
      <TombolTema className={IKON_DI_SAMPUL} />
      <TombolKeluar className={IKON_DI_SAMPUL} />
    </div>
  );
}

export function RelAdmin({ menunggu, nama }: { menunggu: number; nama: string }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-7 bg-sampul px-4 py-6 text-sampul-teks lg:flex">
      <Merek />
      <nav aria-label="Menu admin">
        <DaftarMenu menunggu={menunggu} />
      </nav>
      <KakiRel nama={nama} />
    </aside>
  );
}

export function BilahAtasAdmin({ menunggu, nama }: { menunggu: number; nama: string }) {
  const [buka, setBuka] = useState(false);
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-sampul px-4 text-sampul-teks lg:hidden">
      <Merek />
      <button type="button" onClick={() => setBuka(true)} className="grid size-10 place-items-center rounded-lg hover:bg-sampul-aktif" aria-label="Buka menu">
        <MenuIcon className="size-5" />
      </button>
      <Sheet open={buka} onOpenChange={setBuka}>
        <SheetContent side="left" className="flex w-72 flex-col border-r-0 bg-sampul p-5 text-sampul-teks">
          <SheetTitle className="sr-only">Menu admin</SheetTitle>
          <div className="mb-6">
            <Merek />
          </div>
          <nav aria-label="Menu admin">
            <DaftarMenu menunggu={menunggu} onPilih={() => setBuka(false)} />
          </nav>
          <KakiRel nama={nama} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
