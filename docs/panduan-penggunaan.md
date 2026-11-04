# Hadir · Panduan Singkat

Aplikasi absensi peserta magang. Peserta check-in dan check-out setiap hari, admin memantau kehadiran dan mengunduh laporan.

**Link aplikasi:** https://absensimagang-detik.vercel.app

## 1. Masuk

Di halaman login ada dua tombol di bawah formulir:

- **Masuk sebagai Peserta demo** untuk mencoba sisi peserta
- **Masuk sebagai Admin demo** untuk mencoba sisi admin

Bisa juga masuk lewat formulir:

| Peran | Email | Kata sandi |
| :--- | :--- | :--- |
| Admin | admin@hadir.id | demo12345 |
| Peserta | rina@peserta.hadir.id | demo12345 |

Untuk berganti peran, tekan ikon **keluar** (panah keluar dari kotak). Peserta: di kanan atas, di samping nama. Admin: di bagian bawah menu samping.

## 2. Sebagai peserta

Menu ada di bawah layar: **Beranda · Riwayat · Pengajuan · Profil**.

| Yang ingin dilakukan | Caranya |
| :--- | :--- |
| Check-in | Di Beranda, tekan **Check-in sekarang**. Jam diambil dari server, statusnya langsung muncul (Tepat waktu atau Terlambat). |
| Check-out | Tekan **Check-out**, tulis singkat apa yang dikerjakan hari ini (logbook), lalu kirim. Durasi kerja hari itu langsung terlihat. |
| Melihat riwayat | Buka **Riwayat**. Pilih tampilan **Daftar** atau **Kalender**, geser bulan dengan tombol panah. |
| Lupa check-out | Di Riwayat, hari berstatus *Tidak check-out* atau *Alpa* punya tautan **Ajukan koreksi**. Isi jam yang benar dan alasannya. |
| Izin atau sakit | Buka **Pengajuan**, tab **Izin / sakit**. Pilih jenis, tanggal, tulis alasan, kirim. |
| Membatalkan pengajuan | Pengajuan yang masih menunggu bisa dibatalkan dari daftar di halaman Pengajuan. |
| Mode gelap | Tekan ikon bulan / matahari di bilah atas. |

Setelah admin memutuskan, pengajuan diberi **cap** DISETUJUI atau DITOLAK beserta tanggal dan inisial admin.

## 3. Sebagai admin

Menu ada di sisi kiri (di HP, tekan ikon menu di kanan atas): **Dashboard · Peserta · Laporan · Persetujuan · Profil**. Tombol ganti tema dan keluar ada di bagian bawah menu, di samping nama akun.

| Halaman | Isinya |
| :--- | :--- |
| Dashboard | Jumlah hadir, terlambat, izin/sakit, dan belum absen hari ini. Grafik kehadiran 10 hari kerja terakhir, ketidakhadiran bulan ini, daftar peserta hari ini, dan pengajuan yang bisa langsung diputuskan. |
| Peserta | Daftar peserta dengan status hari ini dan pencarian nama. Tekan nama peserta untuk melihat kalender, riwayat, dan logbooknya. **Tambah peserta** (nama, email, kampus, role) membuat akun dengan kata sandi sementara yang ditampilkan sekali; peserta wajib menggantinya saat login pertama. Peserta bisa dinonaktifkan dan diaktifkan lagi. |
| Laporan | Pilih **Minggu ini**, **Bulan ini**, **Bulan lalu**, atau tanggal sendiri. Tabel berisi rekap per peserta: hari kerja, hadir, terlambat, izin, sakit, alpa, rata-rata jam masuk, total jam kerja, dan persentase kehadiran. **Unduh CSV** menghasilkan file yang langsung rapi di Excel. |
| Persetujuan | Tab **Izin / sakit** dan **Koreksi absensi**. Untuk koreksi, jam yang tercatat sekarang ditampilkan di samping jam usulan. Menolak wajib disertai alasan. Koreksi yang disetujui langsung mengubah absensi hari itu. |

## 4. Aturan yang dipakai

| Aturan | Nilai |
| :--- | :--- |
| Hari kerja | Senin sampai Jumat |
| Jam masuk | 09.00 WIB, toleransi 15 menit. Check-in setelah 09.15 dihitung terlambat. |
| Absensi | Satu kali check-in dan satu kali check-out per hari |
| Lupa check-out | Hari itu tercatat *Tidak check-out* sampai dikoreksi |
| Alpa | Hari kerja yang sudah lewat tanpa absensi dan tanpa izin. Dihitung otomatis. |
| Izin / sakit | Paling lama 14 hari per pengajuan. Sabtu dan Minggu tidak ikut dihitung. |
| Koreksi | Paling jauh 7 hari ke belakang, satu pengajuan yang menunggu per tanggal |

## 5. Memasang di HP

- **Android (Chrome):** buka link, tekan menu ⋮, pilih **Instal aplikasi** atau **Tambahkan ke layar utama**.
- **iPhone (Safari):** buka link, tekan tombol Bagikan, pilih **Tambah ke Layar Utama**.

Check-in membutuhkan koneksi internet karena jamnya dicatat oleh server.

## 6. Tentang data demo

Aplikasi sudah berisi enam peserta dengan riwayat dua minggu kerja terakhir: ada yang sering terlambat, ada yang sakit, ada yang lupa check-out, dan ada pengajuan yang masih menunggu keputusan. Peserta demo (Rina) sengaja belum check-in hari ini supaya tombol check-in bisa langsung dicoba.

Data demo dikembalikan ke kondisi awal setiap pagi (sekitar pukul 09.00–10.00 WIB). Semua yang dicoba hari ini, termasuk peserta yang ditambahkan, akan hilang besok paginya, jadi aman untuk dicoba bebas.
