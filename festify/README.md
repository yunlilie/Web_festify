# Festify — Website Informasi Event Interaktif Berbasis Multimedia

React + Vite + CSS murni · Supabase (PostgreSQL, Auth, Storage, RLS) · Google Maps/Places.

> **Status: Tahap 2 (UI/UX) selesai — menunggu persetujuan.**
> Seluruh halaman sudah berfungsi dengan **data pratinjau di memori** (`src/services/preview/`).
> Pada Tahap 4, isi setiap file `src/services/*.js` diganti query Supabase; halaman tidak perlu diubah.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # produksi → dist/
```

Selama `.env.local` belum berisi kredensial Supabase, aplikasi berjalan dalam **mode pratinjau**.
Gunakan bar hitam di atas → “Lihat sebagai” untuk berpindah peran (Pengunjung / User / Organizer / Admin).
Akun contoh untuk form login (password bebas): `rani@contoh.id`, `halo@nadanusantara.id`, `admin@festify.id`.
Data pratinjau kembali ke awal setiap kali halaman di-refresh.

## Design system

| Token | Nilai | Pemakaian |
|---|---|---|
| Plum 600 `--primary` | `#6A0DAD` | Tombol utama, link, fokus |
| Plum 900 | `#2A0A45` | Sidebar dashboard, footer |
| Magenta | `#BE3496` | Gradien brand |
| Coral `--accent` | `#F43F5E` | Aksen, badge baru, tombol favorit aktif |
| Amber | `#FFA94D` | Gradien brand, bintang rating |
| Paper `--bg` | `#FFF8F4` | Latar halaman (krem hangat) |
| Ink 900 | `#1C1326` | Teks utama |
| Gradien brand | magenta → coral → amber | CTA “Beli tiket”, highlight judul, aksen tab |

- **Tipografi:** Fraunces (judul, serif editorial) + Inter (teks & UI). Skala 12 / 14 / 16 / 18 / 22 / 28 / 36 / fluid 36–64 px.
- **Spacing:** kelipatan 4 px (`--sp-1` … `--sp-20`). **Radius:** 8 / 12 / 18 / 26 / pill.
- **Ikon:** satu set — `lucide-react` (outline, 18–20 px).
- **Motion:** 140–220 ms, `cubic-bezier(.22,.8,.3,1)`, otomatis nonaktif bila `prefers-reduced-motion`.
- **Poster sebagai elemen utama:** rasio 3:4. Bila poster belum ada atau gagal dimuat, `Poster.jsx` membuat artwork gradien yang konsisten per judul.
- File token: `src/styles/tokens.css`. Komponen: `components.css`. Layout: `layouts.css`. Halaman: `pages.css`.

## Struktur

```
src/
├─ components/ui/       Button, Field (Input/Select/Textarea/Password/Checkbox), Badge, Modal/ConfirmDialog,
│                       States (Empty/Error/Skeleton/Alert), Pagination, Tabs, StarRating, Avatar, Logo,
│                       Poster, StatCard, LineChart (SVG ringan), FileDrop
├─ components/event/    EventCard, FilterPanel, Gallery (lightbox), ReviewSection, PlaceSearch, CategoryIcon
├─ components/layout/   Navbar, UserMenu, Footer, PreviewBar (dihapus di Tahap 4)
├─ layouts/             PublicLayout, AuthLayout, DashboardLayout (organizer & admin)
├─ routes/              AppRoutes, ProtectedRoute / RoleRoute / GuestRoute
├─ context/             AuthContext, ToastContext, FavoritesContext
├─ hooks/               useAsync, useDebounce, useDocumentTitle
├─ services/            catalog, event, review, favorite, notification, stats, admin, profile, storage
│  └─ preview/          data contoh + penyimpanan in-memory (DIHAPUS di Tahap 4)
├─ lib/                 supabaseClient, googleMaps (loader Places)
├─ utils/               format, validators, datetime, slugify, errors, constants
└─ pages/               public/, auth/, user/, organizer/ (+ eventForm/ 5 langkah), admin/
```

## Keputusan yang sudah disetujui

- Organizer **langsung aktif** (tanpa persetujuan admin), lewat pilihan saat registrasi atau menu “Jadi organizer”. Role `admin` tidak pernah bisa didapat dari frontend.
- Event **tidak perlu disetujui admin** sebelum tampil. Validasi kelengkapan (REQ-BR-0.6) dijalankan saat publish.
- Wilayah: **Jabodetabek** (14 kota/kabupaten). Kecamatan opsional.
- File: gambar JPG/PNG/WebP ≤ 5 MB, video MP4/WebM ≤ 50 MB, atau tautan YouTube.
- Di luar rilis pertama: Upgrade Plan, followers EO, batas usia event.
- Database: project Supabase **yang sudah ada**. Skrip reset dibuat terpisah untuk Anda review dan jalankan sendiri.

## Hasil uji Tahap 2 (otomatis, Playwright + Chrome, mode pratinjau)

Lulus 16/16:
- Proteksi route guest, user, dan organizer, termasuk redirect ke `/login` dan `/403`.
- Validasi login, login berhasil, dan kembali ke halaman asal hanya bila role-nya berhak.
- Filter kategori, filter harga gratis, dan empty state pencarian.
- Simpan favorit lalu tampil di halaman Favorit.
- Ulasan dengan kata terlarang ditolak, ulasan sopan tersimpan.
- Tombol tiket membuka tab baru ke URL resmi.
- Validasi form event per langkah, dan simpan draft.
- Admin tidak bisa mengubah role sendiri.
- Tanpa error JavaScript.

**Belum diuji (butuh Tahap 3–4):** autentikasi Supabase sungguhan, Google OAuth, email verifikasi/reset, RLS, upload ke Storage, Google Places Autocomplete (butuh API key), embed peta & YouTube (diblokir jaringan sandbox), serta tampilan di perangkat fisik (responsif dicek di viewport 390 px dan 1440 px).
