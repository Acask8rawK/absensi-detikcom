import { wajibPeran } from "@/lib/auth";
import { db } from "@/lib/db";
import { inisialDari } from "@/components/rapor";
import { TombolKeluar } from "@/components/tombol-keluar";
import { TombolTema } from "@/components/tema";
import { NavigasiPeserta } from "@/components/peserta/navigasi";

// Tombol ikon di atas warna sampul hijau.
const IKON_DI_SAMPUL = "size-9 text-sampul-teks hover:bg-sampul-aktif hover:text-white dark:hover:bg-sampul-aktif";

export default async function LayoutPeserta({ children }: LayoutProps<"/peserta">) {
  const peserta = await wajibPeran("PESERTA");
  const menunggu =
    (await db.pengajuanIzin.count({ where: { penggunaId: peserta.id, status: "MENUNGGU" } })) +
    (await db.pengajuanKoreksi.count({ where: { penggunaId: peserta.id, status: "MENUNGGU" } }));

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="bg-sampul text-sampul-teks">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <span className="flex items-center gap-2 font-bold tracking-tight">
            <span className="grid size-7 place-items-center rounded-md bg-sampul-teks text-sm text-sampul" aria-hidden>
              H
            </span>
            Hadir
          </span>
          {/* Tema dan keluar ada di bilah atas supaya bisa dijangkau dari halaman mana pun. */}
          <span className="flex items-center gap-1 text-sm">
            <TombolTema className={IKON_DI_SAMPUL} />
            <span className="mr-1 ml-2 hidden sm:inline">{peserta.nama}</span>
            <span className="grid size-8 place-items-center rounded-md border border-sampul-teks/30 text-xs font-semibold" aria-label={peserta.nama}>
              {inisialDari(peserta.nama)}
            </span>
            <TombolKeluar className={IKON_DI_SAMPUL} />
          </span>
        </div>
      </header>
      <NavigasiPeserta menunggu={menunggu} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-28 md:pb-10">{children}</main>
    </div>
  );
}
