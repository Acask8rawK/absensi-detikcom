# Tahap 1 · Analisis Kebutuhan

Aplikasi Absensi Peserta Magang · Assignment Fullstack Developer, IT Product Development detikcom
Model pengembangan: Waterfall (Analisis → Desain → Implementasi → Integrasi & Pengujian)

---

## 1. Soal yang diberikan

| Hal | Isi |
| :--- | :--- |
| Tugas | Aplikasi absensi sederhana untuk peserta magang |
| Wajib | Peserta bisa check-in dan check-out setiap hari |
| Wajib | Admin bisa melihat daftar peserta dan laporan absensinya |
| Bebas | "Fitur plus lainnya silakan improve sendiri" |
| Pengumpulan | File, atau link aplikasi yang bisa diakses dan dicoba. Kalau di Google Drive, akses diubah ke *Anyone with the link – Viewer* |
| Dokumentasi | Dokumen singkat tentang fitur dan cara penggunaan aplikasi |
| Tenggat | Kamis, 5 November 2026 pukul **14.30 WIB** (sidebar detikJobs menulis 15.00; yang dipakai yang lebih awal) |

Catatan jadwal: psikotes juga hari Kamis pukul 11.00. Target kirim **Kamis paling lambat 09.00**, supaya tidak bertabrakan dengan psikotes.

---

## 2. Siapa yang memakai aplikasi

| Aktor | Kebutuhan utama |
| :--- | :--- |
| Peserta magang | Absen cepat dari HP atau laptop, melihat riwayat sendiri, mengajukan izin |
| Admin (HR / mentor) | Melihat siapa yang hadir hari ini, daftar peserta, rekap per periode, mengunduh laporan |
| Penguji dari HR detik | Bisa langsung mencoba **tanpa mendaftar**, dan langsung melihat data yang bermakna |

Aktor ketiga sering terlupa. Penguji tidak akan membuat akun atau mengisi data selama 15 menit. Kalau laporan kosong, kesan pertamanya buruk. Karena itu ada akun demo dan data contoh (FR-02, FR-16).

---

## 3. Membaca soal: dari kalimat ke keputusan

| Kalimat di soal | Yang tersirat | Keputusan |
| :--- | :--- | :--- |
| "check-in serta check-out **setiap hari**" | Satu kali check-in dan satu kali check-out per hari | Dijaga oleh database: satu baris absensi per peserta per tanggal |
| "check-in serta check-out" | Check-out hanya boleh setelah check-in | Tombol check-out baru muncul setelah check-in, dan server menolak urutan yang salah |
| (tidak tertulis) | Jam absen tidak boleh bisa dipalsukan | Waktu diambil dari **server**, bukan dari jam HP peserta |
| (tidak tertulis) | Server Vercel berjalan di UTC, kantor di Jakarta | Tanggal absen dihitung dalam zona **WIB (Asia/Jakarta)** |
| "melihat **daftar** peserta" | Daftar yang bisa dicari, dengan status hari ini | Halaman daftar peserta dengan pencarian dan status |
| "**report** absensinya" | Rekap per periode, bukan cuma tabel mentah | Laporan dengan filter tanggal, ringkasan per peserta, unduh CSV |
| "dapat diakses dan **dicoba**" | Harus online, bisa langsung dipakai | Deploy online, akun demo satu klik, data contoh dua minggu |
| "dokumentasi singkat" | Penguji butuh panduan, bukan dokumen teknis | README + panduan pemakaian 1–2 halaman dengan tangkapan layar |

---

## 4. Kebutuhan fungsional

Prioritas memakai MoSCoW: **M**ust (wajib dari soal), **S**hould (nilai plus utama), **C**ould (kalau waktu cukup), **W**on't (sengaja tidak dikerjakan).

Daftar ini sudah disepakati pada 4 November 2026.

| Kode | Fitur | Aktor | Prioritas |
| :--- | :--- | :--- | :---: |
| FR-01 | Login dengan email dan kata sandi | Semua | M |
| FR-02 | RBAC: peran Admin dan Peserta, setiap halaman dan aksi dicek perannya di server | Sistem | M |
| FR-03 | Tombol "Masuk sebagai demo" (admin dan peserta) di halaman login | Penguji | M |
| FR-04 | Check-in harian | Peserta | M |
| FR-05 | Check-out harian, dengan logbook aktivitas hari itu | Peserta | M |
| FR-06 | Riwayat absensi milik sendiri | Peserta | M |
| FR-07 | Daftar peserta, dengan pencarian dan status hari ini | Admin | M |
| FR-08 | Laporan absensi per periode, ringkasan per peserta, unduh CSV | Admin | M |
| FR-09 | Status otomatis: Tepat waktu, Terlambat, Tidak check-out, Alpa, Izin, Sakit, Hari libur | Sistem | S |
| FR-10 | Dashboard statistik admin: angka hari ini, grafik kehadiran per status, ketidakhadiran bulan ini, peserta hari ini, antrean persetujuan | Admin | S |
| FR-11 | Detail peserta: kalender, riwayat absensi, logbook | Admin | S |
| FR-12 | Pengajuan izin/sakit dengan alasan, disetujui atau ditolak admin | Peserta, Admin | S |
| FR-13 | Koreksi absensi: kalau lupa check-out (atau check-in), peserta mengajukan jam yang benar dengan alasan, admin menyetujui atau menolak | Peserta, Admin | S |
| FR-14 | Kelola peserta: tambah (dengan kata sandi sementara), nonaktifkan, aktifkan lagi | Admin | S |
| FR-15 | Wajib ganti kata sandi saat login pertama untuk akun buatan admin | Peserta | S |
| FR-16 | Kalender kehadiran: warna per hari untuk hadir, terlambat, izin/sakit, alpa | Peserta, Admin | S |
| FR-17 | Responsif dan PWA: nyaman di HP dan bisa dipasang ke layar utama | Semua | S |
| FR-18 | Mode gelap | Semua | S |
| FR-19 | Data contoh: 6 peserta dengan riwayat dua minggu, termasuk izin dan koreksi | Penguji | M |
| — | Pengaturan jam masuk lewat UI, lokasi GPS, foto selfie / face recognition, QR code, notifikasi WA/email, aplikasi native | — | W |

Jam masuk (09.00) dan toleransi (15 menit) disimpan sebagai konfigurasi di kode, bukan diatur lewat tampilan.

---

## 5. Aturan bisnis (asumsi yang ditulis eksplisit)

1. **Hari kerja Senin–Jumat**, sesuai lowongan (5 hari per minggu, libur Sabtu dan Minggu). Sabtu dan Minggu tidak dihitung Alpa. Absen di akhir pekan tetap boleh dan ditandai "Hari libur", supaya penguji tetap bisa mencoba di hari apa pun.
2. **Jam masuk 09.00 WIB, toleransi 15 menit.** Check-in setelah 09.15 berstatus Terlambat.
3. **Satu check-in dan satu check-out per hari.** Check-in kedua di hari yang sama ditolak dengan pesan yang jelas.
4. **Lupa check-out:** setelah hari berganti, absensi tanpa check-out berstatus "Tidak check-out" dan durasi kerjanya tidak dihitung.
5. **Alpa** = hari kerja sejak tanggal mulai magang, tanpa check-in dan tanpa izin yang disetujui. Alpa dihitung saat laporan dibuat, tidak disimpan sebagai baris data.
6. **Izin/sakit** diajukan untuk satu tanggal atau rentang tanggal, berstatus Menunggu → Disetujui / Ditolak. Penolakan wajib diberi alasan.
7. **Koreksi absensi** hanya untuk tanggal yang sudah lewat, maksimal 7 hari ke belakang, dan satu pengajuan yang menunggu per tanggal. Jika disetujui, jam di absensi diganti dan absensi ditandai "Dikoreksi", supaya jejaknya terlihat.
8. **Peserta nonaktif** tidak bisa login dan tidak dihitung di laporan setelah dinonaktifkan.
9. **Tidak ada pendaftaran mandiri.** Akun peserta dibuat admin dengan kata sandi sementara.

---

## 6. Kebutuhan non-fungsional

| Aspek | Kebutuhan |
| :--- | :--- |
| Bahasa | Seluruh antarmuka dalam Bahasa Indonesia, format tanggal Indonesia (Kamis, 5 November 2026) |
| Kemudahan | Peserta bisa absen dalam ≤ 2 klik setelah login; tampilan diprioritaskan untuk HP |
| Keamanan | Kata sandi di-hash (bcrypt); sesi di cookie HttpOnly; peran dicek di server, bukan hanya menyembunyikan menu; peserta hanya bisa membaca datanya sendiri |
| Integritas data | Aturan "satu absensi per peserta per hari" dijaga constraint database, bukan hanya oleh tampilan |
| Waktu | Semua jam dan tanggal dari server, dihitung dalam WIB |
| Ketersediaan | Bisa diakses online kapan saja selama masa penilaian |
| Kinerja | Halaman utama tampil < 2 detik di koneksi biasa |
| Perawatan | Struktur folder jelas, kode diberi komentar, README berisi cara menjalankan |

---

## 7. Pilihan teknologi

| Lapisan | Pilihan | Alasan |
| :--- | :--- | :--- |
| Framework | Next.js (App Router) + TypeScript | Frontend dan backend dalam satu proyek dan satu deploy; stack yang sudah dipakai di proyek Kemlu dan SMART HR |
| Database | PostgreSQL | Mendukung constraint unik, tipe tanggal, dan agregasi untuk laporan |
| ORM | Prisma | Skema tertulis jelas, migrasi tercatat, tipe otomatis |
| Tampilan | Tailwind CSS + komponen shadcn/ui | Tampilan bersih dan konsisten tanpa menulis CSS dari nol |
| Autentikasi | Sesi buatan sendiri: bcrypt + JWT di cookie HttpOnly | Sederhana, mudah dijelaskan baris per baris, cukup untuk dua peran |
| Hosting | Vercel (aplikasi) + Postgres terkelola (Supabase atau Neon) | Gratis, deploy dari Git, link langsung bisa dibagikan |

| Grafik | shadcn/ui Chart (di atas Recharts) | Komponen grafik yang tampilannya serasi dengan komponen lain, dan mengikuti mode gelap |
| Database online | Supabase (hanya dipakai sebagai PostgreSQL) | Gratis dan sudah pernah dipakai di portofolio dan Fitt.Gym |

### Autentikasi dan verifikasi

| Pertanyaan | Keputusan |
| :--- | :--- |
| Bagaimana login? | Email + kata sandi. Kata sandi disimpan sebagai hash bcrypt, tidak pernah teks asli. |
| Sesi disimpan di mana? | Token JWT bertanda tangan (HS256, library `jose`) di cookie **HttpOnly, Secure, SameSite=Lax**, berlaku 8 jam. JavaScript di browser tidak bisa membacanya. |
| Bagaimana sesi diverifikasi? | Dua lapis. (1) Di setiap request, `proxy.ts` memeriksa tanda tangan dan masa berlaku token, lalu mengarahkan ke halaman sesuai peran. (2) Di setiap aksi server, fungsi `wajibPeran()` membaca ulang user dari database: masih aktif? perannya masih sama? |
| Kenapa dua lapis? | Token tidak bisa dicabut sebelum kedaluwarsa. Pengecekan ke database memastikan peserta yang dinonaktifkan langsung tertolak, dan aturan peran tidak bergantung pada tombol yang disembunyikan. |
| Verifikasi akun? | Tidak ada pendaftaran publik, jadi tidak perlu verifikasi email. Admin membuat akun dengan kata sandi sementara, dan peserta wajib menggantinya saat login pertama. |
| Kenapa tidak Supabase Auth atau Auth.js? | Keduanya bisa. Sesi buatan sendiri dipilih karena hanya sekitar 100 baris, tanpa ketergantungan tambahan, dan setiap barisnya bisa dijelaskan di interview. |

Alternatif yang dipertimbangkan: Laravel + MySQL (mungkin dekat dengan stack detik, tapi kurang lancar dipakai dan deploy lebih lama), FastAPI + React (dua aplikasi dan dua deploy, terlalu lama untuk tenggat ini).

---

## 8. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
| :--- | :--- | :--- |
| Waktu sempit, psikotes di hari yang sama | Tidak terkirim | Fitur Must dulu sampai ter-deploy, baru Should. Kirim Kamis ≤ 09.00 |
| Salah tanggal karena server di UTC | Absen jam 06.00 WIB tercatat di tanggal kemarin | Satu fungsi khusus "tanggal hari ini (WIB)" dipakai di semua tempat, dan diuji |
| Penguji menemukan laporan kosong | Kesan pertama buruk | Data contoh dua minggu untuk 5–6 peserta |
| Double check-in karena klik dua kali / koneksi lambat | Data ganda | Constraint unik di database + tombol nonaktif saat memproses |
| Penguji tidak tahu akun yang dipakai | Tidak jadi mencoba | Tombol akun demo di halaman login + tertulis di panduan |
| Database gratis "tidur" lalu lambat di akses pertama | Penguji mengira aplikasi rusak | Pakai koneksi pooling, buka sendiri aplikasi sebelum mengirim link |

---

## 9. Jadwal

| Waktu | Tahap |
| :--- | :--- |
| Rabu 4 Nov, pagi | Tahap 1 · Analisis kebutuhan (dokumen ini) |
| Rabu 4 Nov, siang | Tahap 2 · Desain: flowchart, ERD, rancangan tampilan |
| Rabu 4 Nov, sore–malam | Tahap 3 · Implementasi, lalu deploy |
| Rabu 4 Nov, malam | Tahap 4 · Integrasi & pengujian, panduan pemakaian |
| Kamis 5 Nov, ≤ 09.00 | Cek akhir dan kirim lewat detikJobs |
| Kamis 5 Nov, 11.00 | Psikotes |
| Kamis 5 Nov, 14.30 | Tenggat assignment |
