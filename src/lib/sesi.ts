import { jwtVerify, SignJWT } from "jose";
import { SESI_JAM } from "./konfigurasi";

// Token sesi dibuat dan dibaca di dua tempat: Server Action (lib/auth.ts) dan
// proxy.ts. Karena itu file ini tidak boleh memakai Prisma atau API khusus Node.

export const NAMA_COOKIE = "hadir_sesi";
export const UMUR_SESI_DETIK = SESI_JAM * 60 * 60;

export type IsiSesi = {
  id: string;
  peran: "ADMIN" | "PESERTA";
  /** true jika kata sandi sementara belum diganti */
  gantiSandi: boolean;
};

function kunci() {
  const rahasia = process.env.SESSION_SECRET;
  if (!rahasia || rahasia.length < 32) {
    // Lebih baik gagal keras daripada diam-diam menandatangani token dengan kunci lemah.
    throw new Error("SESSION_SECRET belum diisi atau kurang dari 32 karakter.");
  }
  return new TextEncoder().encode(rahasia);
}

export async function buatToken(isi: IsiSesi) {
  return new SignJWT({ peran: isi.peran, gs: isi.gantiSandi })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(isi.id)
    .setIssuedAt()
    .setExpirationTime(`${SESI_JAM}h`)
    .sign(kunci());
}

/** Mengembalikan isi sesi, atau null jika token tidak ada, rusak, atau kedaluwarsa. */
export async function bacaToken(token: string | undefined): Promise<IsiSesi | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, kunci(), { algorithms: ["HS256"] });
    if (!payload.sub || (payload.peran !== "ADMIN" && payload.peran !== "PESERTA")) return null;
    return { id: payload.sub, peran: payload.peran, gantiSandi: payload.gs === true };
  } catch {
    return null;
  }
}

export function berandaUntuk(peran: IsiSesi["peran"]) {
  return peran === "ADMIN" ? "/admin" : "/peserta";
}
