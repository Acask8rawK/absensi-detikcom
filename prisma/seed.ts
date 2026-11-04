import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { isiDataDemo, SANDI_DEMO } from "../src/lib/data-demo";

// Mengisi database dengan data contoh. Data lama dihapus dulu, jadi perintah ini
// aman dijalankan ulang kapan saja untuk mengembalikan demo ke kondisi awal.

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL }) });

isiDataDemo(db)
  .then(({ dari, sampai }) => {
    console.log(`Seed selesai. Data contoh dari ${dari} sampai ${sampai}.`);
    console.log(`Akun demo: admin@hadir.id dan rina@peserta.hadir.id, kata sandi ${SANDI_DEMO}.`);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
