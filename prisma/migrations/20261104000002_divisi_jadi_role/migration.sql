-- Kolom "divisi" diganti namanya menjadi "role" (posisi kerja peserta), mengikuti label di aplikasi.
ALTER TABLE "pengguna" RENAME COLUMN "divisi" TO "role";
