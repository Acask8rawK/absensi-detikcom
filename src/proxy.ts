import { NextResponse, type NextRequest } from "next/server";
import { bacaToken, berandaUntuk, NAMA_COOKIE } from "@/lib/sesi";

// Lapis pertama pemeriksaan akses: dijalankan sebelum setiap halaman dirender.
// Tugasnya hanya mengarahkan URL. Aturan sebenarnya tetap dicek lagi di server
// (wajibPeran) karena proxy tidak membaca database.

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sesi = await bacaToken(request.cookies.get(NAMA_COOKIE)?.value);
  const ke = (path: string) => NextResponse.redirect(new URL(path, request.url));

  const halamanLogin = pathname === "/login";
  const halamanGantiSandi = pathname === "/ganti-kata-sandi";

  if (!sesi) {
    return halamanLogin ? NextResponse.next() : ke("/login");
  }

  if (sesi.gantiSandi && !halamanGantiSandi) return ke("/ganti-kata-sandi");

  if (halamanLogin || pathname === "/") return ke(berandaUntuk(sesi.peran));
  if (pathname.startsWith("/admin") && sesi.peran !== "ADMIN") return ke("/peserta");
  if (pathname.startsWith("/peserta") && sesi.peran !== "PESERTA") return ke("/admin");

  return NextResponse.next();
}

export const config = {
  // Lewati aset statis, file PWA, halaman offline, dan /keluar (harus selalu bisa dipakai).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest|sw.js|ikon|offline|keluar|api/cron).*)"],
};
