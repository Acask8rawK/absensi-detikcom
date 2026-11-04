# Tahap 3 · Implementasi

Rencana kerja dari desain ke kode. Urutannya mengikuti ketergantungan: lapisan bawah dulu, tampilan terakhir.

## Urutan pengerjaan

| # | Modul | Isi | Selesai jika |
| :-: | :--- | :--- | :--- |
| 1 | Kerangka proyek | Next.js 16 (App Router, TypeScript), Tailwind 4, komponen shadcn/ui, font Public Sans, token warna Buku Rapor | Halaman kosong tampil dengan font dan warna yang benar |
| 2 | Database | `schema.prisma` sesuai ERD, migrasi pertama + index unik sebagian untuk koreksi, `seed.ts` | `prisma migrate deploy` dan seed berjalan di Supabase |
| 3 | Logika inti | `waktu.ts` (tanggal WIB, hari kerja, format Indonesia), `status.ts` (FC-6), `laporan.ts` (FC-7) | Unit test lulus |
| 4 | Autentikasi & RBAC | `auth.ts` (bcrypt, JWT di cookie, `wajibPeran()`), `proxy.ts`, login + akun demo, ganti kata sandi | Admin dan peserta diarahkan ke halamannya masing-masing |
| 5 | Fitur peserta | Beranda (check-in/out + logbook), Riwayat (daftar & kalender), Pengajuan (izin & koreksi), Profil | Alur FC-2, FC-3, FC-4, FC-5 dari sisi peserta berjalan |
| 6 | Fitur admin | Dashboard statistik, Peserta (tambah, nonaktifkan), Detail peserta, Laporan + CSV, Persetujuan dengan cap | Alur FC-4, FC-5, FC-7 dari sisi admin berjalan |
| 7 | Penyelesaian | PWA (manifest, service worker, halaman offline), mode gelap, keadaan kosong/memuat/gagal | Bisa dipasang di HP, tampilan gelap rapi |
| 8 | Deploy | Vercel + variabel lingkungan + migrasi produksi | Link publik bisa dibuka |

## Konvensi kode

- **Bahasa:** nama domain dalam Bahasa Indonesia (`absensi`, `pengajuanIzin`, `wajibPeran`), istilah teknis tetap Inggris (`proxy`, `schema`, `action`).
- **Tempat aturan:** setiap aturan bisnis yang penting dicek di server (Server Action) dan, bila mungkin, dijaga database. Tampilan hanya membantu.
- **Validasi:** semua input Server Action divalidasi dengan Zod.
- **Waktu:** jangan pernah memakai `new Date()` langsung untuk menentukan tanggal absen. Selalu lewat `waktu.ts`.
- **Komentar:** menjelaskan *kenapa* sebuah keputusan diambil, bukan mengulang apa yang sudah jelas dari kodenya.

## Variabel lingkungan

| Nama | Isi |
| :--- | :--- |
| `DATABASE_URL` | Connection string Supabase lewat pooler (port 6543), dipakai aplikasi saat berjalan |
| `DIRECT_URL` | Connection string langsung / session (port 5432), dipakai untuk migrasi |
| `SESSION_SECRET` | Kunci acak minimal 32 karakter untuk menandatangani token sesi |
