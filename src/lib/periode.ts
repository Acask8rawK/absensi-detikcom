import { akhirBulan, awalBulan, awalMinggu, tambahHari, type Tanggal } from "./waktu";

// Pilihan periode laporan. Dipakai halaman laporan dan unduhan CSV, jadi
// keduanya selalu menghitung rentang yang sama dari parameter URL yang sama.

export const PERIODE = [
  { id: "minggu-ini", label: "Minggu ini" },
  { id: "bulan-ini", label: "Bulan ini" },
  { id: "bulan-lalu", label: "Bulan lalu" },
] as const;

const polaTanggal = /^\d{4}-\d{2}-\d{2}$/;

export function bacaPeriode(sp: Record<string, string | string[] | undefined>, hariIni: Tanggal) {
  const dari = typeof sp.dari === "string" && polaTanggal.test(sp.dari) ? sp.dari : null;
  const sampai = typeof sp.sampai === "string" && polaTanggal.test(sp.sampai) ? sp.sampai : null;
  if (dari && sampai && dari <= sampai) return { id: "kustom", dari, sampai };

  switch (sp.periode) {
    case "minggu-ini":
      return { id: "minggu-ini", dari: awalMinggu(hariIni), sampai: hariIni };
    case "bulan-lalu": {
      const akhir = tambahHari(awalBulan(hariIni), -1);
      return { id: "bulan-lalu", dari: awalBulan(akhir), sampai: akhirBulan(akhir) };
    }
    default:
      return { id: "bulan-ini", dari: awalBulan(hariIni), sampai: hariIni };
  }
}
