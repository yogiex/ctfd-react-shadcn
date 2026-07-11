# Spesifikasi Kebutuhan Perangkat Lunak (SKPL) — Refactoring Frontend CTFd

> **Versi**: 1.0  
> **Status**: Draft  
> **Teknologi Target**: React 18 + TypeScript + shadcn/ui + Tailwind CSS  
> **Backend**: CTFd 3.8.6 — Flask 2.1 / Python 3.11  
> **Dokumen Referensi**: PRD.md, SRS.md

---

## 1. Pendahuluan

### 1.1 Tujuan

Dokumen Spesifikasi Kebutuhan Perangkat Lunak (SKPL) ini bertujuan untuk mendefinisikan secara lengkap dan terperinci kebutuhan fungsional dan non-fungsional untuk proyek refactoring frontend CTFd dari arsitektur multi-theme (Jinja2 + Alpine.js + Vue 2/3 + Bootstrap + jQuery) menjadi sebuah Single Page Application (SPA) berbasis React 18 + TypeScript + shadcn/ui + Tailwind CSS.

Dokumen ini ditujukan untuk pengembang frontend, penguji (QA), dan pemangku kepentingan proyek sebagai acuan dalam implementasi, verifikasi, dan validasi.

### 1.2 Ruang Lingkup

Ruang lingkup dokumen ini mencakup:

1. Spesifikasi kebutuhan fungsional untuk seluruh fitur frontend, terbagi dalam 16 area fungsional utama (KF-01 hingga KF-16)
2. Spesifikasi kebutuhan non-fungsional mencakup 7 kategori (KNF-01 hingga KNF-07)
3. Spesifikasi antarmuka eksternal (API, SSE, file upload, initial data injection)
4. Pemetaan fitur ke fase pengembangan (MVP Public, Admin Panel, Plugin System)
5. Matriks traceability yang menghubungkan kebutuhan ke fitur dan fase

Dokumen ini **tidak** mencakup:

- Perubahan pada backend API Flask
- Perubahan skema database
- Perubahan sistem plugin backend
- Dokumentasi pengguna akhir

### 1.3 Definisi

| Istilah       | Definisi                                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------------------------- |
| **CTFd**      | Platform Capture The Flag open-source versi 3.8.6                                                                     |
| **SPA**       | Single Page Application — aplikasi web yang memuat satu halaman HTML dan menavigasi secara dinamis tanpa reload penuh |
| **shadcn/ui** | Koleksi komponen React yang dapat dikustomisasi, dibangun di atas Radix UI primitives dan Tailwind CSS                |
| **SSE**       | Server-Sent Events — mekanisme push notification satu arah dari server ke klien melalui HTTP                          |
| **CSRF**      | Cross-Site Request Forgery — mekanisme keamanan menggunakan token nonce                                               |
| **REST API**  | Representational State Transfer API yang disediakan oleh CTFd di endpoint `/api/v1/`                                  |
| **Jinja2**    | Template engine Python yang digunakan oleh Flask untuk merender HTML                                                  |
| **Alpine.js** | Framework JavaScript ringan untuk interaktivitas di sisi klien (digunakan di tema core saat ini)                      |
| **Vite**      | Build tool untuk frontend modern (digunakan untuk build tema saat ini dan SPA baru)                                   |
| **Bootstrap** | Framework CSS yang digunakan di tema core (v5) dan admin (v4)                                                         |
| **Plugin**    | Ekstensi pihak ketiga untuk CTFd yang menambahkan tipe challenge, flag, atau fitur lainnya                            |
| **Nonce**     | Angka acak sekali pakai yang digunakan sebagai token CSRF                                                             |

---

## 2. Deskripsi Umum Sistem

### 2.1 Arsitektur Sistem

Sistem terdiri dari dua komponen utama:

1. **Backend (CTFd 3.8.6)**: Server Flask 2.1 / Python 3.11 yang menyediakan REST API di `/api/v1/`, melayani file statis, mengelola sesi, autentikasi, dan SSE events. Backend menyuntikkan data awal melalui `window.init` pada halaman HTML shell.

2. **Frontend Baru (React SPA)**: Aplikasi React 18 + TypeScript yang berkomunikasi dengan backend secara eksklusif melalui REST API dan SSE. Frontend bertanggung jawab atas rendering UI, routing, state management, dan interaksi pengguna.

### 2.2 Karakteristik Pengguna

| Karakteristik         | Deskripsi                                                                             |
| --------------------- | ------------------------------------------------------------------------------------- |
| **Pemain CTF**        | Individu atau anggota tim yang memecahkan tantangan keamanan                          |
| **Penyelenggara CTF** | Administrator yang membuat tantangan, mengelola peserta, dan mengonfigurasi kompetisi |
| **Pengembang Plugin** | Pihak ketiga yang mengembangkan ekstensi untuk CTFd                                   |
| **Kapten Tim**        | Pemain yang mengelola keanggotaan tim                                                 |

### 2.3 Lingkungan Operasi

- **Browser yang didukung**: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+
- **Koneksi jaringan**: Broadband (minimal 1 Mbps) — dengan graceful degradation untuk koneksi lambat
- **Dukungan subdirektori**: Aplikasi harus berfungsi jika CTFd di-deploy di subpath (misal `https://example.com/ctfd/`)

---

## 3. Kebutuhan Fungsional

### KF-01: Autentikasi Pengguna

| ID       | Kebutuhan                                                                                      | Prioritas |
| -------- | ---------------------------------------------------------------------------------------------- | --------- |
| KF-01.01 | Sistem harus menyediakan halaman login dengan input email dan password                         | Tinggi    |
| KF-01.02 | Sistem harus memvalidasi kredensial melalui endpoint `POST /api/v1/users/me`                   | Tinggi    |
| KF-01.03 | Sistem harus mengarahkan pengguna yang sudah login ke halaman sebelumnya atau beranda          | Tinggi    |
| KF-01.04 | Sistem harus menyediakan halaman registrasi dengan nama, email, dan password                   | Tinggi    |
| KF-01.05 | Sistem harus mendukung opsi kode invite saat registrasi                                        | Sedang    |
| KF-01.06 | Sistem harus menampilkan banner konfirmasi email untuk pengguna yang belum terverifikasi       | Sedang    |
| KF-01.07 | Sistem harus menyediakan halaman permintaan reset password via email                           | Sedang    |
| KF-01.08 | Sistem harus menyediakan halaman untuk mengatur ulang password dengan token dari email         | Sedang    |
| KF-01.09 | Sistem harus mendukung logout yang menghapus sesi dan mengarahkan ke beranda                   | Tinggi    |
| KF-01.10 | Sistem harus memeriksa validitas sesi saat aplikasi dimuat; jika tidak valid, arahkan ke login | Tinggi    |
| KF-01.11 | Sistem harus menyertakan header `CSRF-Token` pada setiap permintaan yang mengubah state        | Tinggi    |

### KF-02: Challenge Board (Papan Tantangan)

| ID       | Kebutuhan                                                                                            | Prioritas |
| -------- | ---------------------------------------------------------------------------------------------------- | --------- |
| KF-02.01 | Sistem harus menampilkan daftar challenge dalam bentuk kartu yang dikelompokkan berdasarkan kategori | Tinggi    |
| KF-02.02 | Setiap kartu challenge harus menampilkan nama, kategori, nilai, dan jumlah solves                    | Tinggi    |
| KF-02.03 | Sistem harus menyediakan filter kategori dan filter solved/unsolved                                  | Tinggi    |
| KF-02.04 | Sistem harus menampilkan detail challenge (deskripsi, file, hints) di modal atau panel samping       | Tinggi    |
| KF-02.05 | Sistem harus menyediakan form submit flag dengan feedback langsung (benar/salah/sudah solved)        | Tinggi    |
| KF-02.06 | Sistem harus menampilkan tombol unlock hint dengan konfirmasi biaya (jika berbayar)                  | Tinggi    |
| KF-02.07 | Sistem harus menyediakan tautan download untuk file attachment challenge                             | Tinggi    |
| KF-02.08 | Sistem harus menandai challenge yang sudah solved dengan indikator visual                            | Tinggi    |
| KF-02.09 | Sistem harus memperbarui daftar challenge secara real-time melalui SSE                               | Sedang    |

### KF-03: Scoreboard (Papan Skor)

| ID       | Kebutuhan                                                                                    | Prioritas |
| -------- | -------------------------------------------------------------------------------------------- | --------- |
| KF-03.01 | Sistem harus menampilkan tabel peringkat dengan posisi, nama, skor, dan waktu solve terakhir | Tinggi    |
| KF-03.02 | Tabel peringkat harus mendukung pagination untuk jumlah peserta besar                        | Tinggi    |
| KF-03.03 | Sistem harus menampilkan grafik garis skor untuk 10 tim teratas                              | Sedang    |
| KF-03.04 | Sistem harus menyediakan filter bracket jika dikonfigurasi                                   | Rendah    |
| KF-03.05 | Sistem harus menampilkan indikator jika skor dibekukan (freeze)                              | Sedang    |
| KF-03.06 | Tabel harus responsif dan tetap terbaca di perangkat mobile                                  | Tinggi    |

### KF-04: Profil Pengguna

| ID       | Kebutuhan                                                                                | Prioritas |
| -------- | ---------------------------------------------------------------------------------------- | --------- |
| KF-04.01 | Sistem harus menampilkan profil publik pengguna (nama, afiliasi, negara, website, score) | Tinggi    |
| KF-04.02 | Sistem harus menampilkan daftar solve pengguna (nama challenge, kategori, nilai, waktu)  | Tinggi    |
| KF-04.03 | Sistem harus menampilkan awards/medali pengguna                                          | Sedang    |
| KF-04.04 | Sistem harus menyediakan halaman settings untuk mengedit profil                          | Tinggi    |
| KF-04.05 | Sistem harus menyediakan form ganti password (password lama, password baru, konfirmasi)  | Tinggi    |
| KF-04.06 | Sistem harus menyediakan form ganti email dengan verifikasi                              | Sedang    |

### KF-05: Manajemen Tim

| ID       | Kebutuhan                                                                      | Prioritas |
| -------- | ------------------------------------------------------------------------------ | --------- |
| KF-05.01 | Sistem harus menampilkan halaman daftar tim publik                             | Sedang    |
| KF-05.02 | Sistem harus menyediakan form pembuatan tim (nama, password, opsi invite code) | Tinggi    |
| KF-05.03 | Sistem harus menyediakan form join tim (nama tim + password atau link invite)  | Tinggi    |
| KF-05.04 | Sistem harus menampilkan profil publik tim (anggota, skor, solves)             | Tinggi    |
| KF-05.05 | Sistem harus menyediakan fitur leave tim dengan konfirmasi                     | Sedang    |
| KF-05.06 | Sistem harus mendukung transfer kapten tim dengan konfirmasi                   | Sedang    |
| KF-05.07 | Sistem harus menyediakan fitur invite anggota (link undangan)                  | Sedang    |

### KF-06: Notifikasi Real-time

| ID       | Kebutuhan                                                                               | Prioritas |
| -------- | --------------------------------------------------------------------------------------- | --------- |
| KF-06.01 | Sistem harus membuka koneksi EventSource ke endpoint `GET /events`                      | Tinggi    |
| KF-06.02 | Sistem harus menampilkan toast notifikasi untuk setiap event yang diterima              | Tinggi    |
| KF-06.03 | Sistem harus menyediakan pusat notifikasi yang menampilkan riwayat notifikasi sesi      | Sedang    |
| KF-06.04 | Sistem harus otomatis reconnect ke SSE dengan exponential backoff saat koneksi terputus | Sedang    |

### KF-07: Halaman Statis

| ID       | Kebutuhan                                                                              | Prioritas |
| -------- | -------------------------------------------------------------------------------------- | --------- |
| KF-07.01 | Sistem harus merender halaman Markdown statis berdasarkan rute yang dikonfigurasi      | Tinggi    |
| KF-07.02 | Sistem harus mengamankan halaman yang memerlukan autentikasi jika `auth_required` true | Sedang    |
| KF-07.03 | Sistem harus menyembunyikan halaman draft dari pengguna non-admin                      | Sedang    |

### KF-08: Dark Mode

| ID       | Kebutuhan                                                                | Prioritas |
| -------- | ------------------------------------------------------------------------ | --------- |
| KF-08.01 | Sistem harus mendeteksi preferensi tema sistem (`prefers-color-scheme`)  | Sedang    |
| KF-08.02 | Sistem harus menyediakan toggle manual untuk mengganti tema terang/gelap | Sedang    |
| KF-08.03 | Sistem harus menyimpan preferensi tema di localStorage                   | Sedang    |
| KF-08.04 | Semua komponen harus mendukung tema terang dan gelap tanpa flicker       | Tinggi    |

### KF-09: Admin Dashboard

| ID       | Kebutuhan                                                                                    | Prioritas |
| -------- | -------------------------------------------------------------------------------------------- | --------- |
| KF-09.01 | Sistem harus menampilkan ringkasan: jumlah user, jumlah challenge, jumlah submission terbaru | Sedang    |
| KF-09.02 | Sistem harus menampilkan grafik aktivitas (submissions per jam/hari)                         | Rendah    |

### KF-10: Admin Manajemen Challenge

| ID       | Kebutuhan                                                                                                           | Prioritas |
| -------- | ------------------------------------------------------------------------------------------------------------------- | --------- |
| KF-10.01 | Sistem harus menampilkan tabel semua challenge (nama, kategori, nilai, tipe, state, solves)                         | Tinggi    |
| KF-10.02 | Sistem harus menyediakan wizard pembuatan challenge (pilih tipe → isi konfigurasi)                                  | Tinggi    |
| KF-10.03 | Sistem harus menyediakan halaman edit challenge dengan tab: detail, flags, hints, files, tags, topics, requirements | Tinggi    |
| KF-10.04 | Sistem harus mendukung CRUD flags (static, regex, custom types)                                                     | Tinggi    |
| KF-10.05 | Sistem harus mendukung CRUD hints (gratis atau berbayar dengan cost)                                                | Tinggi    |
| KF-10.06 | Sistem harus mendukung upload dan delete file challenge                                                             | Tinggi    |
| KF-10.07 | Sistem harus mendukung CRUD tags dan topics                                                                         | Sedang    |
| KF-10.08 | Sistem harus mendukung pengaturan prasyarat challenge (challenge requirements)                                      | Sedang    |
| KF-10.09 | Sistem harus menyediakan preview challenge dari sisi pemain                                                         | Sedang    |
| KF-10.10 | Sistem harus menampilkan submission log per challenge                                                               | Sedang    |

### KF-11: Admin Manajemen User

| ID       | Kebutuhan                                                                                           | Prioritas |
| -------- | --------------------------------------------------------------------------------------------------- | --------- |
| KF-11.01 | Sistem harus menampilkan tabel user (nama, email, verified, banned, team, skor)                     | Tinggi    |
| KF-11.02 | Sistem harus menyediakan fitur pencarian user berdasarkan nama atau email                           | Tinggi    |
| KF-11.03 | Sistem harus menyediakan form edit user (nama, email, password, afiliasi, negara, verified, banned) | Tinggi    |
| KF-11.04 | Sistem harus menyediakan fitur delete user dengan konfirmasi                                        | Tinggi    |
| KF-11.05 | Sistem harus mendukung penambahan award untuk user                                                  | Sedang    |
| KF-11.06 | Sistem harus menampilkan alamat IP yang digunakan oleh user                                         | Rendah    |

### KF-12: Admin Manajemen Tim

| ID       | Kebutuhan                                                               | Prioritas |
| -------- | ----------------------------------------------------------------------- | --------- |
| KF-12.01 | Sistem harus menampilkan tabel tim (nama, kapten, jumlah anggota, skor) | Tinggi    |
| KF-12.02 | Sistem harus menyediakan fitur pencarian tim berdasarkan nama           | Sedang    |
| KF-12.03 | Sistem harus menyediakan form edit tim (nama, password, kapten)         | Tinggi    |
| KF-12.04 | Sistem harus menyediakan fitur delete tim dengan konfirmasi             | Tinggi    |
| KF-12.05 | Sistem harus mendukung merge dua tim                                    | Rendah    |

### KF-13: Admin Konfigurasi CTF

| ID       | Kebutuhan                                                                              | Prioritas |
| -------- | -------------------------------------------------------------------------------------- | --------- |
| KF-13.01 | Sistem harus menyediakan halaman konfigurasi umum (nama CTF, deskripsi, user mode)     | Tinggi    |
| KF-13.02 | Sistem harus menyediakan halaman visibilitas (challenge, scoreboard, registrasi, akun) | Tinggi    |
| KF-13.03 | Sistem harus menyediakan halaman waktu (start, end, freeze, timezone)                  | Tinggi    |
| KF-13.04 | Sistem harus menyediakan halaman email (SMTP, Mailgun, verifikasi email)               | Sedang    |
| KF-13.05 | Sistem harus menyediakan halaman tema (logo, icon, warna, header/footer)               | Sedang    |
| KF-13.06 | Sistem harus menyediakan halaman backup (download/upload arsip)                        | Sedang    |
| KF-13.07 | Sistem harus menyediakan halaman fields (custom field definisi)                        | Rendah    |
| KF-13.08 | Sistem harus menyediakan halaman bracket                                               | Rendah    |
| KF-13.09 | Sistem harus menyediakan halaman legal (ToS, privacy policy)                           | Rendah    |

### KF-14: Admin Pages CMS

| ID       | Kebutuhan                                                                                      | Prioritas |
| -------- | ---------------------------------------------------------------------------------------------- | --------- |
| KF-14.01 | Sistem harus menampilkan tabel halaman (judul, rute, draft/published, auth)                    | Sedang    |
| KF-14.02 | Sistem harus menyediakan form create/edit halaman (judul, rute, konten Markdown, draft toggle) | Sedang    |
| KF-14.03 | Sistem harus menyediakan fitur delete halaman dengan konfirmasi                                | Sedang    |

### KF-15: Admin Notifikasi

| ID       | Kebutuhan                                                                          | Prioritas |
| -------- | ---------------------------------------------------------------------------------- | --------- |
| KF-15.01 | Sistem harus menyediakan form pengiriman notifikasi (judul, konten, link opsional) | Sedang    |
| KF-15.02 | Sistem harus menampilkan daftar notifikasi yang sudah dikirim                      | Rendah    |
| KF-15.03 | Sistem harus mendukung delete notifikasi                                           | Rendah    |

### KF-16: Admin Import/Export dan Statistik

| ID       | Kebutuhan                                                                                          | Prioritas |
| -------- | -------------------------------------------------------------------------------------------------- | --------- |
| KF-16.01 | Sistem harus menyediakan tombol download arsip export CTF                                          | Sedang    |
| KF-16.02 | Sistem harus menyediakan form upload arsip import CTF                                              | Sedang    |
| KF-16.03 | Sistem harus menampilkan halaman statistik dengan grafik (solves per challenge, user registration) | Rendah    |
| KF-16.04 | Sistem harus menampilkan submission log dengan filter (user, challenge, tipe)                      | Sedang    |

---

## 4. Kebutuhan Non-Fungsional

### KNF-01: Kinerja

| ID        | Kebutuhan                                                                     | Target    |
| --------- | ----------------------------------------------------------------------------- | --------- |
| KNF-01.01 | First Contentful Paint (FCP) tidak boleh melebihi                             | 1,5 detik |
| KNF-01.02 | Time to Interactive (TTI) tidak boleh melebihi                                | 3,0 detik |
| KNF-01.03 | Lighthouse Performance Score minimal                                          | 90        |
| KNF-01.04 | Ukuran bundle JavaScript initial load (gzipped) tidak boleh melebihi          | 250 KB    |
| KNF-01.05 | Render scoreboard dengan 1.000 tim tidak boleh melebihi                       | 2 detik   |
| KNF-01.06 | Waktu respons API untuk daftar challenge tidak boleh melebihi (setelah cache) | 200 md    |
| KNF-01.07 | Semua rute yang tidak digunakan saat initial load harus di-lazy load          | Wajib     |

### KNF-02: Keamanan

| ID        | Kebutuhan                                                                     | Target |
| --------- | ----------------------------------------------------------------------------- | ------ |
| KNF-02.01 | Semua permintaan yang mengubah state harus menyertakan header `CSRF-Token`    | Wajib  |
| KNF-02.02 | Token autentikasi tidak boleh disimpan di localStorage (hanya session cookie) | Wajib  |
| KNF-02.03 | Semua konten Markdown harus disanitasi dengan DOMPurify sebelum dirender      | Wajib  |
| KNF-02.04 | Input pengguna tidak boleh dirender sebagai HTML tanpa escaping               | Wajib  |
| KNF-02.05 | Sistem harus mengarahkan ke login jika menerima respons HTTP 401              | Wajib  |
| KNF-02.06 | Tidak ada data sensitif (password, token) yang boleh muncul di console log    | Wajib  |

### KNF-03: Aksesibilitas

| ID        | Kebutuhan                                                                        | Target |
| --------- | -------------------------------------------------------------------------------- | ------ |
| KNF-03.01 | Aplikasi harus memenuhi standar WCAG 2.1 Level AA                                | Wajib  |
| KNF-03.02 | Semua elemen interaktif harus memiliki nama yang dapat diakses                   | Wajib  |
| KNF-03.03 | Semua form harus memiliki label, pesan error, dan atribut `aria-invalid`         | Wajib  |
| KNF-03.04 | Modal harus memerangkap fokus, menutup dengan Escape, memiliki `aria-labelledby` | Wajib  |
| KNF-03.05 | Kontras warna minimal harus 4.5:1 untuk teks normal                              | Wajib  |
| KNF-03.06 | Navigasi keyboard harus didukung di seluruh fitur                                | Wajib  |
| KNF-03.07 | Link "Skip to content" harus tersedia di semua halaman                           | Sedang |

### KNF-04: Keandalan

| ID        | Kebutuhan                                                                       | Target |
| --------- | ------------------------------------------------------------------------------- | ------ |
| KNF-04.01 | Sistem harus mendeteksi kehilangan koneksi dan menampilkan banner               | Wajib  |
| KNF-04.02 | Permintaan API yang gagal karena jaringan harus di-retry otomatis (3 kali)      | Sedang |
| KNF-04.03 | Jika API tidak tersedia, sistem harus menampilkan halaman error yang informatif | Wajib  |
| KNF-04.04 | Koneksi SSE harus auto-reconnect dengan exponential backoff                     | Wajib  |
| KNF-04.05 | Aplikasi harus tetap berfungsi meskipun ada satu endpoint API yang error        | Sedang |

### KNF-05: Kompatibilitas

| ID        | Kebutuhan                                                                                | Target |
| --------- | ---------------------------------------------------------------------------------------- | ------ |
| KNF-05.01 | Aplikasi harus kompatibel dengan Chrome 90+, Firefox 90+, Safari 15+, Edge 90+           | Wajib  |
| KNF-05.02 | Aplikasi harus responsif dari 320px hingga 1920px lebar viewport                         | Wajib  |
| KNF-05.03 | Aplikasi harus berfungsi di subdirektori (menggunakan `window.init.urlRoot`)             | Wajib  |
| KNF-05.04 | Aplikasi harus kompatibel dengan plugin yang ada (render via iframe/tab baru jika perlu) | Sedang |

### KNF-06: Internasionalisasi (i18n)

| ID        | Kebutuhan                                                                         | Target |
| --------- | --------------------------------------------------------------------------------- | ------ |
| KNF-06.01 | Semua teks antarmuka harus dieksternalisasi ke file JSON                          | Wajib  |
| KNF-06.02 | Sistem harus mendeteksi bahasa dari `navigator.language` atau preferensi pengguna | Sedang |
| KNF-06.03 | Format tanggal dan waktu harus mengikuti locale yang aktif                        | Sedang |

### KNF-07: Pemeliharaan

| ID        | Kebutuhan                                              | Target |
| --------- | ------------------------------------------------------ | ------ |
| KNF-07.01 | Kode harus ditulis dalam TypeScript dengan strict mode | Wajib  |
| KNF-07.02 | Cakupan kode oleh unit test minimal harus              | 80%    |
| KNF-07.03 | Setiap komponen harus memiliki Storybook story         | Sedang |
| KNF-07.04 | Linting (ESLint + Prettier) harus lulus tanpa error    | Wajib  |

---

## 5. Antarmuka Eksternal

### 5.1 Antarmuka REST API

- **Endpoint Base**: `<urlRoot>/api/v1/`
- **Format Data**: JSON
- **Autentikasi**: Session cookie (HttpOnly) + `CSRF-Token` header
- **Kode Error**: 400 (validasi), 401 (unauthorized), 403 (forbidden), 404 (not found), 429 (rate limit), 500 (server error)

### 5.2 Antarmuka SSE (Server-Sent Events)

- **Endpoint**: `GET <urlRoot>/events`
- **Format**: EventSource standar dengan tipe event: `notification`, `challenge-update`, `scoreboard-update`, `config-update`
- **Auto-reconnect**: Ya, dengan exponential backoff (1d → 2d → 4d → 8d → max 30d)

### 5.3 Antarmuka Initial Data Injection

Data awal disuntikkan oleh server Flask melalui tag `<script>` di halaman HTML shell:

```typescript
window.init = {
  urlRoot: string,
  csrfNonce: string,
  userMode: "users" | "teams",
  userId: number | null,
  userName: string | null,
  userEmail: string | null,
  userVerified: boolean,
  teamId: number | null,
  teamName: string | null,
  start: string | null,
  end: string | null,
  themeSettings: string | null,
};
```

### 5.4 Antarmuka File Upload

- **Endpoint**: `POST /api/v1/files`
- **Content-Type**: `multipart/form-data`
- **Response**: `{ success: true, data: { id, location, url } }`

---

## 6. Daftar Fitur per Fase

### Fase 1: MVP Public (F-01 s.d. F-08)

| Kode Fitur | Nama Fitur                | Kebutuhan Fungsional Terkait |
| ---------- | ------------------------- | ---------------------------- |
| F-01       | Authentication            | KF-01                        |
| F-02       | Challenge Board           | KF-02                        |
| F-03       | Scoreboard                | KF-03                        |
| F-04       | User Profile & Settings   | KF-04                        |
| F-05       | Team Management           | KF-05                        |
| F-06       | Notifications (Real-time) | KF-06                        |
| F-07       | Static Pages              | KF-07                        |
| F-08       | Dark Mode                 | KF-08                        |

### Fase 2: Admin Panel (F-09 s.d. F-18)

| Kode Fitur | Nama Fitur                 | Kebutuhan Fungsional Terkait |
| ---------- | -------------------------- | ---------------------------- |
| F-09       | Admin Dashboard            | KF-09                        |
| F-10       | Challenge Management       | KF-10                        |
| F-11       | User Management            | KF-11                        |
| F-12       | Team Management            | KF-12                        |
| F-13       | CTF Configuration          | KF-13                        |
| F-14       | Pages CMS                  | KF-14                        |
| F-15       | Notifications (Admin)      | KF-15                        |
| F-16       | Import/Export & Statistics | KF-16                        |

### Fase 3: Plugin System (F-19 s.d. F-22)

| Kode Fitur | Nama Fitur                 | Kebutuhan Fungsional Terkait          |
| ---------- | -------------------------- | ------------------------------------- |
| F-19       | Plugin Component Registry  | Ekstensi dari KF-10 (challenge types) |
| F-20       | Plugin Hooks Compatibility | Ekstensi dari F-07 (styles/scripts)   |
| F-21       | Admin Plugin Navigation    | Ekstensi dari F-09                    |
| F-22       | Challenge Type SDK         | Ekstensi dari KF-10                   |

---

## 7. Matriks Traceability

| Kode SKPL | Kode PRD         | Kode SRS | Fase   | Prioritas |
| --------- | ---------------- | -------- | ------ | --------- |
| KF-01     | US-15            | FR-01    | Fase 1 | Tinggi    |
| KF-02     | US-01 s.d. US-05 | FR-02    | Fase 1 | Tinggi    |
| KF-03     | US-06 s.d. US-08 | FR-03    | Fase 1 | Tinggi    |
| KF-04     | US-15            | FR-04    | Fase 1 | Tinggi    |
| KF-05     | US-16            | FR-05    | Fase 1 | Tinggi    |
| KF-06     | —                | FR-11    | Fase 1 | Sedang    |
| KF-07     | —                | FR-10    | Fase 1 | Sedang    |
| KF-08     | —                | —        | Fase 1 | Sedang    |
| KF-09     | —                | —        | Fase 2 | Sedang    |
| KF-10     | US-09 s.d. US-12 | FR-06    | Fase 2 | Tinggi    |
| KF-11     | US-13            | FR-07    | Fase 2 | Tinggi    |
| KF-12     | US-14            | FR-08    | Fase 2 | Tinggi    |
| KF-13     | US-17 s.d. US-20 | FR-09    | Fase 2 | Tinggi    |
| KF-14     | —                | FR-10    | Fase 2 | Sedang    |
| KF-15     | —                | FR-11    | Fase 2 | Sedang    |
| KF-16     | —                | FR-12    | Fase 2 | Sedang    |
| KNF-01    | Performance      | NFR-01   | Semua  | Tinggi    |
| KNF-02    | Security         | NFR-02   | Semua  | Tinggi    |
| KNF-03    | Accessibility    | NFR-03   | Semua  | Tinggi    |
| KNF-04    | Reliability      | NFR-04   | Semua  | Sedang    |
| KNF-05    | Compatibility    | —        | Semua  | Tinggi    |
| KNF-06    | i18n             | NFR-05   | Semua  | Sedang    |
| KNF-07    | Maintainability  | —        | Semua  | Sedang    |
