-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Peran" AS ENUM ('ADMIN', 'PESERTA');

-- CreateEnum
CREATE TYPE "StatusMasuk" AS ENUM ('TEPAT_WAKTU', 'TERLAMBAT', 'HARI_LIBUR');

-- CreateEnum
CREATE TYPE "JenisIzin" AS ENUM ('IZIN', 'SAKIT');

-- CreateEnum
CREATE TYPE "StatusPengajuan" AS ENUM ('MENUNGGU', 'DISETUJUI', 'DITOLAK');

-- CreateTable
CREATE TABLE "pengguna" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "kata_sandi_hash" TEXT NOT NULL,
    "peran" "Peran" NOT NULL,
    "divisi" TEXT,
    "kampus" TEXT,
    "tanggal_mulai" DATE,
    "tanggal_selesai" DATE,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "wajib_ganti_sandi" BOOLEAN NOT NULL DEFAULT false,
    "akun_demo" BOOLEAN NOT NULL DEFAULT false,
    "dibuat_pada" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "pengguna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absensi" (
    "id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "jam_masuk" TIMESTAMPTZ(3) NOT NULL,
    "jam_pulang" TIMESTAMPTZ(3),
    "status_masuk" "StatusMasuk" NOT NULL,
    "menit_terlambat" INTEGER NOT NULL DEFAULT 0,
    "logbook" TEXT,
    "dikoreksi" BOOLEAN NOT NULL DEFAULT false,
    "dibuat_pada" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "absensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengajuan_izin" (
    "id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "jenis" "JenisIzin" NOT NULL,
    "tanggal_mulai" DATE NOT NULL,
    "tanggal_selesai" DATE NOT NULL,
    "alasan" TEXT NOT NULL,
    "status" "StatusPengajuan" NOT NULL DEFAULT 'MENUNGGU',
    "catatan_admin" TEXT,
    "ditinjau_oleh_id" TEXT,
    "ditinjau_pada" TIMESTAMPTZ(3),
    "dibuat_pada" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pengajuan_izin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengajuan_koreksi" (
    "id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "jam_masuk_usulan" TIMESTAMPTZ(3),
    "jam_pulang_usulan" TIMESTAMPTZ(3),
    "alasan" TEXT NOT NULL,
    "status" "StatusPengajuan" NOT NULL DEFAULT 'MENUNGGU',
    "catatan_admin" TEXT,
    "ditinjau_oleh_id" TEXT,
    "ditinjau_pada" TIMESTAMPTZ(3),
    "dibuat_pada" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pengajuan_koreksi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_email_key" ON "pengguna"("email");

-- CreateIndex
CREATE INDEX "absensi_tanggal_idx" ON "absensi"("tanggal");

-- CreateIndex
CREATE UNIQUE INDEX "absensi_pengguna_id_tanggal_key" ON "absensi"("pengguna_id", "tanggal");

-- CreateIndex
CREATE INDEX "pengajuan_izin_pengguna_id_status_idx" ON "pengajuan_izin"("pengguna_id", "status");

-- CreateIndex
CREATE INDEX "pengajuan_izin_tanggal_mulai_tanggal_selesai_idx" ON "pengajuan_izin"("tanggal_mulai", "tanggal_selesai");

-- CreateIndex
CREATE INDEX "pengajuan_koreksi_pengguna_id_tanggal_idx" ON "pengajuan_koreksi"("pengguna_id", "tanggal");

-- CreateIndex
CREATE INDEX "pengajuan_koreksi_status_idx" ON "pengajuan_koreksi"("status");

-- AddForeignKey
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_izin" ADD CONSTRAINT "pengajuan_izin_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_izin" ADD CONSTRAINT "pengajuan_izin_ditinjau_oleh_id_fkey" FOREIGN KEY ("ditinjau_oleh_id") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_koreksi" ADD CONSTRAINT "pengajuan_koreksi_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_koreksi" ADD CONSTRAINT "pengajuan_koreksi_ditinjau_oleh_id_fkey" FOREIGN KEY ("ditinjau_oleh_id") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Hanya boleh ada satu koreksi berstatus MENUNGGU per peserta per tanggal.
-- Setelah ditolak, peserta boleh mengajukan lagi, jadi index ini dibatasi dengan WHERE.
CREATE UNIQUE INDEX "pengajuan_koreksi_satu_menunggu" ON "pengajuan_koreksi"("pengguna_id", "tanggal") WHERE "status" = 'MENUNGGU';
