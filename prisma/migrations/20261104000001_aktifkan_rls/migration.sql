-- Supabase membuka tabel di skema public lewat Data API (PostgREST).
-- Aplikasi ini tidak memakai API itu; semua akses lewat server Next.js dengan
-- Prisma. RLS tanpa policy berarti peran anon/authenticated tidak bisa membaca
-- atau mengubah apa pun, sementara koneksi Prisma (peran postgres) tetap jalan.
ALTER TABLE "pengguna" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "absensi" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pengajuan_izin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pengajuan_koreksi" ENABLE ROW LEVEL SECURITY;
