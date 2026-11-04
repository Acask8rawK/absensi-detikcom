import { type NextRequest } from "next/server";
import { wajibPeran } from "@/lib/auth";
import { dataLaporan } from "@/lib/data";
import { bacaPeriode } from "@/lib/periode";
import { formatMenitHari, tanggalWIB } from "@/lib/waktu";

// Unduhan laporan sebagai CSV. Pemisah titik koma dan BOM UTF-8 dipakai karena
// Excel dengan pengaturan Indonesia membaca koma sebagai tanda desimal.

function sel(nilai: string | number) {
  const s = String(nilai);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: NextRequest) {
  await wajibPeran("ADMIN");
  const sp = Object.fromEntries(request.nextUrl.searchParams);
  const hariIni = tanggalWIB();
  const periode = bacaPeriode(sp, hariIni);
  const cari = (sp.cari ?? "").trim().slice(0, 60);
  const baris = await dataLaporan(periode.dari, periode.sampai, cari, hariIni);

  const kepala = ["Nama", "Kampus", "Hari kerja", "Hadir", "Tepat waktu", "Terlambat", "Izin", "Sakit", "Alpa", "Tidak check-out", "Rata-rata jam masuk", "Total jam kerja", "Kehadiran (%)"];
  const isi = baris.map(({ nama, kampus, rekap: r }) => [
    nama,
    kampus ?? "",
    r.hariKerja,
    r.hadir,
    r.tepatWaktu,
    r.terlambat,
    r.izin,
    r.sakit,
    r.alpa,
    r.tidakCheckout,
    r.rataJamMasuk !== null ? formatMenitHari(r.rataJamMasuk) : "",
    (r.totalMenitKerja / 60).toFixed(1).replace(".", ","),
    r.persenKehadiran ?? "",
  ]);

  const csv = "﻿" + [kepala, ...isi].map((b) => b.map(sel).join(";")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="laporan-absensi_${periode.dari}_${periode.sampai}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
