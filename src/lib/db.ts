import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Saat development, Next.js memuat ulang modul setiap kali file berubah. Tanpa
// menyimpan client di globalThis, setiap reload membuka pool koneksi baru dan
// koneksi Supabase cepat habis.
const globalUntukPrisma = globalThis as unknown as { prisma?: PrismaClient };

function buatClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const db = globalUntukPrisma.prisma ?? buatClient();

if (process.env.NODE_ENV !== "production") globalUntukPrisma.prisma = db;
