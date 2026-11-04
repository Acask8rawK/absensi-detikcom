import "dotenv/config";
import { defineConfig } from "prisma/config";

// Migrasi butuh koneksi langsung (DIRECT_URL, port 5432). Aplikasi sendiri memakai
// DATABASE_URL lewat pooler; lihat src/lib/db.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
