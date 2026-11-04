import { NextResponse, type NextRequest } from "next/server";
import { NAMA_COOKIE } from "@/lib/sesi";

// Menghapus sesi lalu kembali ke halaman login. Dipakai saat akun ternyata
// sudah nonaktif di tengah sesi yang tokennya masih berlaku.
export function GET(request: NextRequest) {
  const alasan = request.nextUrl.searchParams.get("alasan");
  const tujuan = new URL("/login", request.url);
  if (alasan) tujuan.searchParams.set("pesan", alasan);
  const res = NextResponse.redirect(tujuan);
  res.cookies.delete(NAMA_COOKIE);
  return res;
}
