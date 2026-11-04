# Tahap 4 · Integrasi dan Pengujian

Tujuan tahap ini: memastikan modul-modul yang dibuat terpisah (autentikasi, absensi, pengajuan, laporan, PWA) bekerja bersama sesuai kebutuhan di [01-analisis-kebutuhan.md](01-analisis-kebutuhan.md) dan desain di [02-desain.md](02-desain.md).

Pengujian dilakukan dua lapis:

1. **Unit test otomatis** untuk logika murni yang paling menentukan angka di laporan.
2. **Uji fungsional (black-box)** per kebutuhan, dijalankan di browser terhadap database Supabase sungguhan.

---

## 1. Lingkungan uji

| Bagian | Nilai |
| :--- | :--- |
| Aplikasi | `npm run dev` (Next.js 16) di localhost |
| Database | Supabase PostgreSQL, region Tokyo, berisi data contoh dari `npm run db:seed` |
| Browser | Chromium, layar desktop 1460×1052 dan ponsel 375×812 |
| Tema | Terang dan gelap |
| Tanggal uji | Rabu, 4 November 2026, sekitar pukul 19.00 WIB |

Karena pengujian dilakukan malam hari, check-in peserta demo tercatat **terlambat 10 jam 7 menit**. Itu sekaligus menguji kasus keterlambatan yang ekstrem.

---

## 2. Unit test

Dijalankan dengan `npm test` (Vitest). Hasil: **3 file, 28 tes, semua lulus.**

| File | Yang diuji |
| :--- | :--- |
| `src/lib/waktu.test.ts` | Tanggal "hari ini" dihitung dalam WIB walaupun server di UTC (18.30 UTC = 01.30 WIB besoknya). Batas tepat waktu 09.15, menit terlambat dihitung dari 09.00. Check-in Sabtu/Minggu = hari libur. Awal minggu dari hari Minggu, akhir Februari tahun kabisat, hari kerja terakhir melompati akhir pekan. Format "Kamis, 5 November 2026", "08.47", "7 j 42 m". |
| `src/lib/status.test.ts` | Semua cabang flowchart FC-6: di luar periode magang, absensi lengkap, lembur hari libur, sedang bekerja vs tidak check-out, akhir pekan yang tercakup izin tetap libur, izin/sakit, alpa vs belum absen. |
| `src/lib/rekap.test.ts` | Rekap satu peserta dengan campuran tepat waktu, terlambat, lupa check-out, sakit, alpa, dan hari ini yang belum absen. Persentase kehadiran, rata-rata jam masuk, total jam kerja. Izin Jumat–Senin hanya terhitung 2 hari kerja. Pilihan periode laporan (minggu ini, bulan ini, bulan lalu, rentang sendiri, input tidak valid). |

Selain itu: `tsc --noEmit` (TypeScript), `eslint`, dan `next build` lulus tanpa error.

---

## 3. Uji fungsional

Kolom **Hasil**: ✓ = sesuai harapan. Kasus yang awalnya gagal dicatat di bagian 4 beserta perbaikannya, lalu diuji ulang.

### Autentikasi dan hak akses

| ID | Kebutuhan | Langkah | Hasil yang diharapkan | Hasil |
| :--- | :--- | :--- | :--- | :---: |
| UJ-01 | FR-03 | Tekan **Masuk sebagai Peserta demo** | Masuk ke Beranda peserta | ✓ |
| UJ-02 | FR-03 | Tekan **Masuk sebagai Admin demo** | Masuk ke Dashboard admin | ✓ |
| UJ-03 | FR-01 | Login `admin@hadir.id` dengan kata sandi salah | Pesan "Email atau kata sandi salah.", email tetap terisi, kolom sandi dikosongkan | ✓ |
| UJ-04 | FR-02 | Login sebagai peserta, buka `/admin` | Dialihkan ke `/peserta` | ✓ |
| UJ-05 | FR-02 | Tanpa login, buka `/peserta`, `/admin`, dan `/api/laporan/csv` | Semua dialihkan ke halaman login | ✓ |
| UJ-06 | FR-02 | Panggil `/api/cron/reset-demo` tanpa kunci dan dengan kunci salah | Ditolak (401) | ✓ |

### Absensi harian (peserta)

| ID | Kebutuhan | Langkah | Hasil yang diharapkan | Hasil |
| :--- | :--- | :--- | :--- | :---: |
| UJ-07 | FR-04, FR-09 | Tekan **Check-in sekarang** pukul 19.07 | Jam masuk 19.07, status "Terlambat 10 j 07 m", notifikasi berhasil | ✓ |
| UJ-08 | FR-04 | Simpan absensi kedua untuk peserta dan tanggal yang sama langsung ke database | Ditolak oleh constraint unik `absensi_pengguna_id_tanggal_key` (di aplikasi muncul "Kamu sudah check-in hari ini.") | ✓ |
| UJ-09 | FR-05 | Check-out dengan logbook "rapat" (5 karakter) | Ditolak, diminta minimal 10 karakter | ✓ |
| UJ-10 | FR-05 | Check-out dengan logbook lengkap | Jam pulang dan durasi tampil, logbook muncul di kartu hari ini | ✓ |
| UJ-11 | FR-06, FR-16 | Buka Riwayat, pindah bulan ke Oktober, pilih tampilan Kalender | Daftar per hari dengan logbook; kalender berwarna sesuai status | ✓ |

### Pengajuan izin dan koreksi

| ID | Kebutuhan | Langkah | Hasil yang diharapkan | Hasil |
| :--- | :--- | :--- | :--- | :---: |
| UJ-12 | FR-12 | Ajukan Sakit 6–30 November | Ditolak "Satu pengajuan maksimal 14 hari.", semua isian tetap ada | ✓ |
| UJ-13 | FR-12 | Ajukan Sakit 6–9 November (Jumat–Senin) | Tersimpan sebagai Menunggu, tertulis "2 hari kerja" | ✓ |
| UJ-14 | FR-13 | Koreksi 3 November, jam masuk 17.00, jam pulang 08.00 | Ditolak "Jam pulang harus setelah jam masuk." | ✓ |
| UJ-15 | FR-13 | Koreksi 3 November, jam pulang 18.30 | Tersimpan sebagai Menunggu | ✓ |
| UJ-16 | FR-13 | Ajukan koreksi kedua untuk 3 November selagi yang pertama menunggu | Ditolak "Masih ada koreksi yang menunggu untuk tanggal ini." (dijaga partial unique index) | ✓ |
| UJ-17 | FR-12 | Admin menyetujui sakit Rina | Kartu pindah ke "Sudah diputuskan" dengan cap DISETUJUI, tanggal, dan inisial admin; angka menunggu berkurang | ✓ |
| UJ-18 | FR-12 | Admin menolak izin tanpa mengisi alasan | Ditolak, alasan wajib minimal 5 karakter | ✓ |
| UJ-19 | FR-12 | Admin menolak izin dengan alasan | Cap DITOLAK, catatan admin tampil di kartu | ✓ |
| UJ-20 | FR-13 | Admin menyetujui koreksi Fajar (jam pulang 17.10) | Absensi 2 November menjadi 08.48–17.10, status dihitung ulang, bertanda DIKOREKSI; jam masuk lama tidak berubah | ✓ |

### Kelola peserta

| ID | Kebutuhan | Langkah | Hasil yang diharapkan | Hasil |
| :--- | :--- | :--- | :--- | :---: |
| UJ-21 | FR-07 | Buka Peserta, cari "fajar" | Hanya Fajar yang tampil, beserta status hari ini | ✓ |
| UJ-22 | FR-11 | Buka detail Fajar | Ringkasan bulan, kalender, ketidakhadiran, riwayat dan logbook | ✓ |
| UJ-23 | FR-14 | Tambah peserta dengan email yang sudah dipakai | Ditolak "Email ini sudah terdaftar.", isian tetap ada | ✓ |
| UJ-24 | FR-14 | Tambah peserta dengan email baru | Kata sandi sementara tampil sekali dengan tombol salin; dialog kosong lagi saat dibuka ulang | ✓ |
| UJ-25 | FR-15 | Login pertama dengan akun baru, lalu coba buka `/peserta` | Selalu diarahkan ke halaman ganti kata sandi; setelah diganti, masuk ke Beranda | ✓ |
| UJ-26 | FR-14 | Nonaktifkan akun yang sedang login | Permintaan berikutnya dari akun itu langsung keluar dengan pesan "Akunmu sudah dinonaktifkan" | ✓ |
| UJ-27 | FR-14 | Tekan **Nonaktifkan** → **Ya**, lalu **Aktifkan** | Status berubah dua arah; tanggal selesai dihapus lagi saat diaktifkan | ✓ |

### Dashboard, laporan, tampilan

| ID | Kebutuhan | Langkah | Hasil yang diharapkan | Hasil |
| :--- | :--- | :--- | :--- | :---: |
| UJ-28 | FR-10 | Buka Dashboard | Angka hari ini, grafik 10 hari kerja (skala 0–jumlah peserta), ketidakhadiran bulan ini, peserta hari ini, pengajuan menunggu | ✓ |
| UJ-29 | FR-08 | Laporan "Bulan lalu" | Oktober: 8 hari kerja (mulai 21 Okt), rekap per peserta cocok dengan data contoh | ✓ |
| UJ-30 | FR-08 | Unduh CSV Oktober | `text/csv`, nama file `laporan-absensi_2026-10-01_2026-10-31.csv`, pemisah titik koma, desimal koma, BOM UTF-8 | ✓ |
| UJ-31 | FR-17 | Semua halaman di layar 375 px | Tidak ada scroll horizontal; peserta memakai navigasi bawah, admin memakai menu; tabel laporan bergeser di dalam bingkainya dengan kolom nama menempel | ✓ |
| UJ-32 | FR-17 | Cek manifest, ikon, service worker, halaman offline | Manifest standalone dengan 3 ikon; semua file PWA bisa diakses tanpa login | ✓ |
| UJ-33 | FR-18 | Ganti tema lewat tombol di bilah atas (peserta) dan bawah sidebar (admin) | Semua halaman terbaca di mode terang dan gelap; pilihan tema tetap saat pindah halaman | ✓ |
| UJ-34 | FR-19 | Jalankan seed ulang saat admin sedang login | Data kembali ke kondisi awal, sesi admin tetap berjalan | ✓ |

---

## 4. Temuan dan perbaikan

Pengujian menemukan beberapa masalah. Semuanya sudah diperbaiki lalu diuji ulang.

| No | Temuan | Penyebab | Perbaikan |
| :--- | :--- | :--- | :--- |
| 1 | Saat server menolak isian (misalnya izin lebih dari 14 hari), semua isian form hilang | React 19 mengosongkan form setiap kali aksinya selesai, termasuk saat gagal | Pembungkus `pertahankanIsian()` mengembalikan isian yang dikirim jika aksi gagal, lalu dipakai sebagai `defaultValue`. Kolom kata sandi sengaja tidak ikut. |
| 2 | Pilihan Izin/Sakit tetap kembali ke "Izin" setelah gagal | React tidak memperbarui `defaultValue` pada `<select>` yang sudah tampil | `select` diberi `key` dari isian, jadi dibuat ulang dengan nilai yang benar |
| 3 | Lencana menulis "Terlambat 607 m" | Menit ditampilkan mentah | Memakai format durasi: "Terlambat 10 j 07 m" |
| 4 | Peserta yang terlambat dan belum pulang tampil hijau "Sedang bekerja" di kalender dan tabel admin | Status "sedang bekerja" tidak membawa informasi terlambat | Lencana dan kalender memakai warna terlambat bila menit terlambat > 0 |
| 5 | Kolom durasi di riwayat terpotong jadi dua baris ("8 j 17" / "m") | Teks boleh terbungkus | `whitespace-nowrap` pada durasi |
| 6 | Kartu izin Jumat–Senin menulis "4 hari" | Menghitung hari kalender | Menghitung hari kerja, sama dengan laporan: "2 hari kerja" |
| 7 | Dialog Tambah peserta menampilkan lagi kata sandi sementara yang lama saat dibuka ulang | State hasil aksi tidak di-reset saat dialog ditutup | Isi dialog dipisah jadi komponen yang dibuat ulang (`key`) setiap dialog dibuka |
| 8 | Titik rata-rata jam masuk jatuh di luar grafik saat rata-rata lewat 10.00 | Batas sumbu Y tetap | Batas sumbu dibuat menyesuaikan data. Grafik ini kemudian dihapus pada revisi tampilan. |
| 9 | Data demo akan "basi": beberapa hari setelah dikumpulkan, semua peserta terlihat alpa | Data contoh dibuat relatif terhadap hari seed dijalankan | Vercel Cron memanggil `/api/cron/reset-demo` setiap pagi untuk menyegarkan data dua minggu terakhir |
| 10 | Penyegaran data membuat penguji yang sedang login keluar dengan pesan "dinonaktifkan" | Seed menghapus lalu membuat ulang akun, jadi id berubah | Akun demo di-*upsert* berdasarkan email (id tetap); akun yang hilang diberi pesan netral "Sesimu sudah berakhir" |
| 11 | Tabel di Supabase terbuka lewat Data API (PostgREST) | Bawaan Supabase untuk skema `public` | Migrasi `aktifkan_rls`: RLS menyala tanpa policy, jadi hanya server aplikasi (Prisma) yang bisa membaca dan menulis |

---

## 5. Kesimpulan

Semua kebutuhan **Must** (FR-01 sampai FR-08, FR-19) dan **Should** (FR-09 sampai FR-18) sudah diuji dan berjalan sesuai desain. Aturan yang paling penting dijaga di dua tempat, di aplikasi dan di database:

- satu check-in per hari (constraint unik),
- check-out hanya sekali (UPDATE bersyarat),
- satu koreksi yang menunggu per tanggal (partial unique index),
- persetujuan koreksi yang mengubah absensi (transaksi).

Batasan yang diketahui:

- Hari libur nasional belum dikenali; yang dianggap hari kerja hanya Senin–Jumat.
- Jam kerja dan toleransi sama untuk semua peserta (diatur di `src/lib/konfigurasi.ts`).
- Check-in tidak bisa dilakukan saat offline, dan ini disengaja karena jam absen harus dari server.
