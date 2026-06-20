# 💻 Panduan Developer: Setup Proyek

Dokumen ini berisi instruksi teknis untuk menjalankan, memodifikasi, dan mengembangkan **Digital Wedding Time Capsule** di lingkungan lokal Anda. Aplikasi ini menggunakan arsitektur Monorepo dengan NPM Workspaces.

## 🛠️ Tech Stack
- **Frontend (`apps/web`)**: Next.js 14, React, Tailwind CSS
- **Backend (`apps/api`)**: NestJS, TypeScript
- **Database**: PostgreSQL (Via Supabase)
- **ORM**: Prisma

---

## 📋 Prerequisites (Persyaratan Sistem)
Sebelum memulai, pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) (Disarankan versi LTS v18+)
- Akun [Supabase](https://supabase.com/) untuk database & storage.

---

## 🚀 Langkah 1: Instalasi Dependensi

Klon repositori ini, lalu jalankan perintah instalasi di folder *root* proyek. Karena ini adalah Monorepo, satu perintah ini akan menginstal dependensi untuk frontend maupun backend.

```bash
npm install
```

---

## 🗄️ Langkah 2: Konfigurasi Supabase & Environment Variables

Terdapat dua skenario untuk langkah ini:

### Skenario A: Anda adalah Anggota Tim (Kolaborator)
Jika Anda bekerja dalam tim dan proyek Supabase sudah dibuat oleh Lead Developer:
1. Anda **TIDAK PERLU** membuat akun Supabase atau melakukan *setup* database.
2. Mintalah file `.env` (untuk backend) dan `.env.local` (untuk frontend) dari rekan tim Anda.
3. Simpan file `.env` di dalam folder `apps/api/` dan file `.env.local` di dalam folder `apps/web/`.
4. Anda bisa langsung melompat ke **Langkah 4: Menjalankan Server Lokal**. (Langkah migrasi tidak perlu dilakukan karena database sudah terpusat).

### Skenario B: Anda Membangun Proyek Sendiri dari Nol
Jika Anda ingin membuat *instance* database Anda sendiri yang terpisah:
1. Buat proyek baru di [Supabase Dashboard](https://supabase.com/).
2. Masuk ke menu **Storage** dan buat *bucket* baru dengan nama **`photos`**. Pastikan Anda mencentang opsi **Public**.
3. Masuk ke menu **Project Settings -> API** untuk mendapatkan `Project URL` dan `anon` (public key).
4. Masuk ke menu **Project Settings -> Database -> Connection String (URI)** dan salin string koneksi Prisma Anda.

Buat file environment di masing-masing aplikasi:

**1. Konfigurasi Backend (NestJS)**
Buat file `apps/api/.env` dan isi dengan:
```env
# Koneksi Database Prisma (Ganti dengan password database Anda)
DATABASE_URL="postgresql://postgres.[PROYEK_ANDA]:[PASSWORD_ANDA]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Kredensial Supabase Storage
SUPABASE_URL="https://[PROYEK_ANDA].supabase.co"
SUPABASE_ANON_KEY="sb_publishable_..."
```

**2. Konfigurasi Frontend (Next.js)**
Buat file `apps/web/.env.local` dan isi dengan:
```env
NEXT_PUBLIC_SUPABASE_URL="https://[PROYEK_ANDA].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_..."
```

---

## 🗃️ Langkah 3: Migrasi Database

Dorong (push) skema Prisma Anda agar Supabase membuatkan tabel-tabel yang diperlukan:

```bash
npm run --workspace=apps/api prisma db push
npm run --workspace=apps/api prisma generate
```

---

## 🏃 Langkah 4: Menjalankan Server Lokal

Anda harus menjalankan kedua server (*Frontend* dan *Backend*) secara bersamaan. Buka dua jendela terminal.

**Terminal 1 (Frontend - Next.js):**
```bash
npm run dev:web
```
*Frontend akan berjalan di http://localhost:3000*

**Terminal 2 (Backend - NestJS):**
```bash
npm run dev:api
```
*Backend akan berjalan di http://localhost:3001*

---

## 🗺️ Struktur Navigasi Aplikasi
Aplikasi ini memiliki arsitektur terpusat di mana Event Organizer mengelola acara dari dasbor utama.

- **Organizer Dashboard**: `http://localhost:3000/` *(Pusat kendali seluruh acara)*
- **Admin Settings**: `http://localhost:3000/admin/[slug]` *(Pengaturan tema, password, dan status acara)*
- **Event Lobby**: `http://localhost:3000/lobby/[slug]` *(Pintu masuk ke semua portal)*

**Portal Spesifik (Diakses via Lobby atau langsung):**
- **Guest View**: `http://localhost:3000/[slug]` *(Wajib berstatus LIVE agar bisa diakses)*
- **Mod Dashboard**: `http://localhost:3000/mod/[slug]` *(Moderasi foto)*
- **Live Wall**: `http://localhost:3000/wall/[slug]` *(Tampilan proyektor)*
- **Bride Hub**: `http://localhost:3000/hub/[slug]` *(Album memori B&G)*
- **Souvenir Scanner**: `http://localhost:3000/souvenir/[slug]` *(Klaim tiket suvenir)*
