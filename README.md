# Hadir · Absensi Peserta Magang

Aplikasi web untuk mencatat kehadiran peserta magang. Peserta melakukan check-in dan check-out setiap hari, admin melihat daftar peserta beserta laporan absensinya.

**Demo:** https://absensimagang-detik.vercel.app · Masuk dengan tombol **Masuk sebagai Peserta demo** atau **Masuk sebagai Admin demo** di halaman login.

## Fitur

**Peserta**

- Check-in dan check-out sekali sehari. Jam diambil dari server, statusnya otomatis (tepat waktu sampai 09.15, lewat dari itu terlambat).
- Logbook singkat saat check-out: apa yang dikerjakan hari itu.
- Riwayat absensi dalam bentuk daftar atau kalender berwarna.
- Pengajuan izin/sakit dan koreksi absensi (misalnya lupa check-out), menunggu persetujuan admin.

**Admin**

- Dashboard: kehadiran hari ini, grafik 10 hari kerja terakhir, ketidakhadiran bulan ini, daftar peserta hari ini, dan pengajuan yang menunggu.
- Kelola peserta: tambah peserta (nama, kampus, role) dengan kata sandi sementara, nonaktifkan atau aktifkan lagi, lihat detail per peserta.
- Laporan per periode dengan rekap per peserta, bisa diunduh sebagai CSV.
- Persetujuan izin/sakit dan koreksi. Penolakan wajib diberi alasan.

**Umum**

- Dua peran (admin dan peserta) yang dicek di setiap halaman dan setiap aksi di server.
- Nyaman dipakai di HP dan bisa dipasang ke layar utama (PWA).
- Mode terang dan gelap, bisa diganti dari bilah atas (peserta) atau bawah sidebar (admin).

## Teknologi

| Bagian | Pilihan |
| :--- | :--- |
| Framework | Next.js 16 (App Router, Server Actions), React 19, TypeScript |
| Database | PostgreSQL (Supabase) dengan Prisma 7 |
| Tampilan | Tailwind CSS 4, komponen shadcn/ui, grafik Recharts |
| Autentikasi | Sesi JWT (jose) di cookie HttpOnly, kata sandi di-hash dengan bcrypt |
| Validasi | Zod di server untuk setiap input |
| Pengujian | Vitest untuk logika status dan rekap |

## Menjalankan di komputer sendiri

Butuh Node.js 20.9 atau lebih baru dan satu database PostgreSQL (misalnya project gratis di Supabase).

```bash
npm install
cp .env.example .env
```

Isi `.env`:

| Variabel | Isi |
| :--- | :--- |
| `DATABASE_URL` | Connection string pooler (port 6543), dipakai aplikasi |
| `DIRECT_URL` | Connection string langsung (port 5432), dipakai migrasi dan seed |
| `SESSION_SECRET` | Teks acak minimal 32 karakter, buat dengan perintah di bawah |

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Lalu siapkan tabel, isi data contoh, dan jalankan:

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

Buka http://localhost:3000.

### Akun demo

| Peran | Email | Kata sandi |
| :--- | :--- | :--- |
| Admin | `admin@hadir.id` | `demo12345` |
| Peserta | `rina@peserta.hadir.id` | `demo12345` |

Data contoh berisi enam peserta dengan riwayat dua minggu kerja terakhir, termasuk keterlambatan, izin, sakit, lupa check-out, dan pengajuan yang masih menunggu. Peserta demo sengaja belum check-in hari ini supaya bisa langsung dicoba. Jalankan `npm run db:seed` lagi kapan saja untuk mengembalikan data ke kondisi awal.

## Perintah lain

```bash
npm test          # unit test
npm run lint
npm run build
```

## Deploy ke Vercel

1. Import repository ini di Vercel.
2. Tambahkan `DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`, dan `CRON_SECRET` (teks acak, cara membuatnya sama dengan `SESSION_SECRET`) di Environment Variables.
3. Deploy. Migrasi dan seed cukup dijalankan sekali dari komputer sendiri ke database yang sama.

`vercel.json` mengatur dua hal:

- fungsi server berjalan di region Tokyo (`hnd1`), sama dengan database, supaya setiap query tidak menyeberang benua;
- cron harian yang memanggil `/api/cron/reset-demo` sekitar pukul 09.30 WIB. Data demo disegarkan menjadi dua minggu kerja terakhir, jadi aplikasi tetap terlihat hidup berapa hari pun setelah dikumpulkan. Endpoint ini hanya menerima permintaan yang membawa `CRON_SECRET`.

## Dokumen

Dikerjakan dengan tahapan SDLC waterfall:

1. [Analisis kebutuhan](docs/01-analisis-kebutuhan.md): kebutuhan fungsional, aturan bisnis, pilihan teknologi
2. [Desain](docs/02-desain.md): arsitektur, flowchart, ERD, desain tampilan
3. [Implementasi](docs/03-implementasi.md): urutan modul dan konvensi kode
4. [Pengujian](docs/04-pengujian.md): unit test dan uji fungsional per kebutuhan

Panduan singkat untuk pengguna: [docs/panduan-penggunaan.md](docs/panduan-penggunaan.md).
