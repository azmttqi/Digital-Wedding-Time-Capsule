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
```

---

## 🏃 Langkah 4: Menjalankan Server Lokal

Anda harus menjalankan kedua server (*Frontend* dan *Backend*) secara bersamaan. Buka dua jendela terminal.

**Terminal 1 (Frontend - Next.js):**
```bash
npm run dev --workspace=apps/web
```
*Frontend akan berjalan di http://localhost:3000*

**Terminal 2 (Backend - NestJS):**
```bash
npm run start:dev --workspace=apps/api
```
*Backend akan berjalan di http://localhost:3001*

---

## 🗺️ Struktur Navigasi Aplikasi
Saat pengembangan, ganti `[slug]` dengan nama acara apa pun (misal: `pernikahan-budi`). Acara akan otomatis dibuat di database saat tamu pertama kali membukanya.
- **Guest View**: `http://localhost:3000/[slug]`
- **Mod Dashboard**: `http://localhost:3000/mod/[slug]` *(PIN Default: 1234)*
- **Live Wall**: `http://localhost:3000/wall/[slug]`
- **Bride Hub**: `http://localhost:3000/hub/[slug]` *(PIN Default: 1234)*
