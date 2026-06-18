# 💍 Digital Wedding Time Capsule

> **Platform *SaaS (Software as a Service)* lengkap untuk mengabadikan momen di hari bahagia.**  
> Solusi *all-in-one* untuk Event Organizer (EO) yang mencakup buku tamu digital interaktif, integrasi penukaran suvenir, manajemen multi-acara, dan pengumpulan foto *real-time* berbasis web.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-10-ea2845?style=flat-square&logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-5-2d3748?style=flat-square&logo=prisma)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## 📋 Deskripsi

Digital Wedding Time Capsule bukan lagi sekadar buku tamu biasa. Ini adalah sebuah platform terpadu berskala penuh (*all-in-one ecosystem*) yang dirancang khusus bagi *Event Organizer* (EO), WO, maupun calon pengantin mandiri. 

Dari mencatat kehadiran buku tamu digital yang terintegrasi dengan penukaran suvenir (*QR Ticket*), mengumpulkan momen-momen seru para tamu langsung dari HP mereka, memoderasi foto secara *live*, hingga mengelola puluhan klien berbeda dari satu panel Lobi Utama (Multi-Acara) yang cerdas. Semuanya terkumpul secara *real-time* di satu tempat.

---

## 🌟 Kenapa Digital Wedding Time Capsule?

Tamu undangan selalu mengambil ratusan foto indah menggunakan HP mereka, tapi sayangnya pengantin sering kali tidak pernah melihat foto-foto tersebut. Di sisi lain, meminta tamu mengunduh aplikasi khusus ke dalam memori HP mereka tentu sangat merepotkan. 

Aplikasi ini memecahkan masalah kerumitan teknis di lapangan dengan pendekatan **PWA (Progressive Web App)** dan **Multi-Acara**.
Bagi Tamu: Mereka hanya perlu memindai *QR Code* di meja mereka untuk mengisi daftar hadir, mengklaim tiket suvenir, dan mengunggah foto. Tanpa perlu mengunduh aplikasi apapun.
Bagi EO / Panitia: Satu aplikasi (PWA) dapat menangani puluhan acara klien yang berbeda dengan sistem PIN dan Tema dinamis yang bisa diubah sesuka hati.

---

## ✨ Fitur Utama

### 📱 Progressive Web App (PWA)
Tanpa perlu unduh dari App Store/Play Store. Tamu cukup memindai QR Code untuk membuka aplikasi. Aplikasi ini sangat ringan, responsif, dan memberikan pengalaman mulus layaknya aplikasi *native* langsung dari peramban (browser) HP tamu.

### 📸 Guest Upload & Misi Foto
Tamu dapat mengambil foto langsung dari kamera web atau mengunggah dari galeri. Tersedia juga "Misi Foto" seru (seperti *Senyum Paling Lebar* atau *OOTD Terbaik*) untuk membuat acara semakin interaktif.

### 👩‍⚖️ Sistem Moderasi Cerdas
Tidak perlu khawatir ada foto yang tidak pantas tayang di layar besar. Semua foto masuk ke dasbor moderator untuk disortir (Setujui/Tolak) oleh panitia atau *Wedding Organizer* sebelum ditampilkan. Terlindungi oleh PIN khusus.

### 📽️ Live Wall Proyektor
Galeri *masonry* yang indah dengan tema gelap (*dark mode*) yang me-*refresh* otomatis. Begitu foto disetujui, foto akan langsung melayang masuk ke layar proyektor utama dengan animasi yang memukau.

### 🎁 Pengambilan Souvenir Bebas Antre
Portal khusus petugas suvenir yang terhubung ke sistem tiket QR Code. Petugas cukup memindai tiket tamu, dan sistem otomatis menandai suvenir telah diambil, mencegah pengambilan ganda dengan cepat dan mudah. Terlindungi oleh PIN khusus.

### 📦 Bride & Groom Hub
Pusat kendali khusus bagi pengantin setelah acara selesai. Cukup dengan satu klik, pengantin dapat mengunduh (*download*) daftar kehadiran buku tamu (berupa Excel/CSV) dan seluruh koleksi foto momen ke dalam satu file `.ZIP` utuh. Terlindungi oleh *Password* eksklusif.

### ⚙️ Portal Admin & Tema Dinamis Global
Kendali penuh di tangan EO atau pengantin. Tersedia Portal Admin untuk mengubah *password*, PIN panitia, dan memilih Palet Warna (*Theme*) aplikasi. Saat warna tema diganti (misal: Rose, Sage, Ocean), seluruh antarmuka aplikasi tamu dan panitia akan langsung berubah secara seketika (*real-time*)!

### 🏢 Multi-Acara & Lobi Cerdas
Tidak perlu aplikasi terpisah untuk setiap klien. PWA ini memiliki Lobi Utama Cerdas berbentuk *dropdown*. EO dapat menampung, melacak, dan berganti antar berbagai acara pernikahan klien hanya dalam satu aplikasi yang sama, serta membuat ruangan pernikahan baru cukup dengan sekali klik!

---

## 🚀 Pengembangan Fitur Selanjutnya (Roadmap)
Aplikasi ini dirancang fleksibel untuk pengembangan lebih lanjut, di antaranya:
- [x] Fitur Buku Tamu Digital dengan QR Code Souvenir Terintegrasi
- [x] Kustomisasi Tema Acara secara dinamis (Editor Tema UI / Palet Warna)
- [x] Dukungan Multi-Acara (Event Dashboard untuk EO)
- [ ] Integrasi Penyimpanan Cloud Eksternal Lanjutan (AWS S3, GCS)
- [ ] Opsi Cetak Foto Langsung (Integrasi Photobooth API)

---

## 💻 Panduan Developer
Ingin berkontribusi, memodifikasi, atau menjalankan proyek ini di komputer Anda sendiri?
Silakan baca panduan teknis lengkapnya di file 👉 **[SETUP.md](./SETUP.md)**
