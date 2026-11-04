---
name: next-js-guideline
description: Aturan wajib penulisan kode Next.js (App Router, versi 16) di repo ini. Gunakan skill ini SETIAP KALI menulis, mengubah, atau me-review kode Next.js apa pun di repo ini - komponen, halaman, layout, Server Action, route handler, query Drizzle, proxy.ts, caching, form, styling Tailwind, atau konfigurasi next.config. Pakai juga saat user menyebut Next.js, React, Server Component, Server Action, revalidate, cache, Zod, atau Drizzle, walaupun tidak menyebut kata guideline.
---

# Aturan penulisan kode Next.js

Berlaku untuk seluruh kode Next.js di repo ini: komponen, Server Action,
route handler, query, dan styling. Kalau sebuah aturan di sini bertentangan
dengan keputusan yang lebih baru dari Bisma (pemilik repo), keputusan itu
menang, tapi sebutkan pertentangannya secara eksplisit di ringkasan atau
PR. Jangan diam-diam mengabaikan aturan.

Stack yang sudah terverifikasi di repo ini (jangan berasumsi lain tanpa
mengecek `package.json`): Next.js 16.4.3, React 19.3.0, TypeScript 5
(strict aktif), Tailwind CSS v4, Drizzle ORM + PostgreSQL (driver `pg`),
Zod 4, Biome (bukan ESLint), Vitest + Testing Library (DB test: PGlite),
package manager npm (`package-lock.json`, script `npm run dev`,
`npm run build`, `npm run start`).

## 0. Cek versi dulu

Sebelum menulis kode, cek versi yang terpasang (`package.json`).
Skill ini menargetkan Next.js 16.x (React 19.2, TypeScript 5.1+).

- Kalau versi terpasang di bawah 16, jangan diam-diam memakai API khusus
  16 (proxy.ts, "use cache", updateTag). Beri tahu Bisma dan tanyakan
  apakah mau upgrade.
- Kalau versi lebih baru dari 16.x, ikuti dokumentasi resmi untuk bagian
  yang berubah dan tandai bagian skill ini yang sudah usang.
- Kalau ragu soal API yang berubah cepat (caching, config), baca
  `node_modules/next/dist/docs/` atau https://nextjs.org/docs sebelum
  menebak.

## 1. Server vs Client

- Semua komponen adalah Server Component secara default.
- Tambahkan "use client" hanya jika butuh state, effect, event handler,
  atau browser API.
- Letakkan "use client" di komponen sekecil mungkin (leaf), jangan di
  layout atau page.
- Fetch data di Server Component, bukan lewat useEffect.
- Query DB hanya di `src/features/<fitur>/repository.ts` lewat `getDb()`;
  modul server di `src/lib/` dan `src/db/`, tidak di komponen UI. Jangan impor
  modul server dari Client Component.
- Paket `server-only` terpasang dan dipakai di modul server
  (`src/lib/server-env.ts`, `src/db/index.ts`); di test, paket ini di-mock
  jadi no-op (lihat `src/test/setup.ts`).
- Props yang dikirim dari Server ke Client Component harus serializable.
  Jangan kirim instance class, fungsi biasa, atau objek DB mentah.
  Kirim data yang sudah dipilih kolomnya saja.

Praktiknya: satu komponen leaf yang butuh interaksi dijadikan Client
Component, lalu dibungkus Server Component yang mengambil datanya.
Jangan seluruh halaman jadi client hanya karena ada satu tombol.

## 2. API yang sekarang async (Next.js 15+)

params, searchParams, cookies(), headers(), dan draftMode() semuanya
async dan wajib di-await. Akses sinkron sudah dihapus di 16.

```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // ...
}
```

Hal yang sama untuk generateMetadata, opengraph-image, dan route
handler. Di Client Component, baca dengan use(params).

## 3. Data dan mutasi

- Mutasi data pakai Server Action, bukan route handler, kecuali dipanggil
  pihak luar (webhook, client non-web).
- Server Action adalah endpoint HTTP publik. Cek otorisasi di dalam
  setiap action (kalau ada mekanismenya). Jangan mengandalkan "halaman
  ini sudah dilindungi" atau menyembunyikan tombol di UI.
- Setiap Server Action wajib: cek otorisasi yang berlaku di repo ini
  (kalau ada mekanisme otorisasi, jangan mengarang sistem auth yang
  belum ada), cek permission atau peran kalau fitur itu punya peran,
  validasi input dengan Zod. Zod sudah dipakai di repo ini; jangan menambah
  library validasi baru tanpa alasan yang ditulis di PR.
- Jangan percaya data dari client, termasuk id, role, dan hidden field.
  Validasi ulang di server dan, kalau ada sesi, ambil user dari sesi,
  bukan dari input.
- Query DB hanya di `src/features/<fitur>/repository.ts` lewat `getDb()`, tidak di komponen UI.
- Mutasi yang menyentuh lebih dari satu tabel dibungkus transaksi
  (db.transaction).
- Setelah mutasi, invalidasi cache yang sesuai (lihat bagian 4).

Urutan wajib: otorisasi (kalau ada) → validasi Zod → mutasi → invalidasi
cache.

Template (sesuaikan nama helper dengan yang sudah ada di repo ini;
jangan mengarang helper baru seolah sudah ada):

```ts
"use server";

import { z } from "zod";
import { updateTag } from "next/cache";
// otorisasi: pakai mekanisme yang sudah ada di repo ini (kalau ada)
// query: pakai repository di src/features/<fitur>/ (lewat getDb())

const createThingSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export type ActionState =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createThingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // 1. otorisasi (kalau ada) — pakai helper yang sudah ada, jangan mengarang
  // 2. permission (kalau fitur itu punya peran)

  const parsed = createThingSchema.safeParse(Object.fromEntries(formData)); // 3. validasi
  if (!parsed.success) {
    return { ok: false, error: "Input tidak valid" };
  }

  await createThing(parsed.data); // 4. mutasi (di repository)
  updateTag("things"); // 5. invalidasi
  return { ok: true };
}
```

- Error yang diharapkan (validasi, konflik, kuota habis) dikembalikan
  sebagai nilai (`{ ok: false, ... }`), bukan di-throw. Error tak
  terduga di-throw dan ditangkap `error.tsx`.
- Di form, pakai `useActionState` (React 19) dan `useFormStatus` untuk
  state pending. Jangan membuat state loading manual.
- Jangan mengembalikan pesan error mentah dari DB atau library ke
  client.

## 4. Caching (Next.js 16)

Caching di 16 bersifat eksplisit. Tidak ada lagi cache implisit pada
`fetch` atau route.

Cek `next.config.ts` dulu untuk melihat apakah `cacheComponents` aktif,
karena aturannya berbeda di dua kondisi itu.

- Jika `cacheComponents` belum aktif, jangan mengaktifkannya tanpa
  perintah Bisma, tapi tulis kode yang tetap kompatibel (data dinamis
  dibungkus Suspense).
- Jika suatu saat diaktifkan, ikuti aturan di bawah: gunakan direktif
  `"use cache"` untuk fungsi atau komponen yang boleh di-cache, atur
  masa hidup dengan `cacheLife(...)`, beri label dengan
  `cacheTag(...)`.
- Di dalam fungsi `"use cache"` dilarang membaca `cookies()`,
  `headers()`, atau data per-user. Baca di luar lalu kirim sebagai
  argumen, atau jangan di-cache.
- Data per-user atau data yang butuh request runtime harus dibungkus
  `<Suspense>` dengan fallback, supaya bagian statis tetap bisa
  di-prerender.
- Jangan menaruh data per-user di cache publik.

```ts
import { cacheLife, cacheTag } from "next/cache";

export async function getPublicArticles() {
  "use cache";
  cacheLife("hours");
  cacheTag("articles");
  return queryPublicArticles();
}
```

API invalidasi:

| Situasi | API |
|---|---|
| Setelah mutasi di Server Action, user harus langsung melihat hasilnya | `updateTag("tag")` (hanya di Server Action) |
| Invalidasi dengan stale-while-revalidate | `revalidateTag("tag", "max")`. Argumen kedua (profil `cacheLife`) wajib |
| Invalidasi seluruh path | `revalidatePath("/path")` |
| Segarkan data yang tidak ter-cache di halaman saat ini | `refresh()` (hanya di Server Action) |

`revalidateTag("tag")` dengan satu argumen sudah tidak valid di 16.

## 5. Proxy (pengganti middleware)

- File `middleware.ts` diganti `proxy.ts`, dan fungsi yang diekspor
  bernama `proxy`. Repo ini belum punya `proxy.ts`; buat hanya kalau
  dibutuhkan (mis. redirect atau pengecekan optimistis), dan jangan
  mengarang sistem sesi yang belum ada.
- Pakai untuk redirect, rewrite, header, dan pengecekan optimistis
  (mis. ada sesi atau tidak).
- Jangan jadikan proxy satu-satunya lapisan otorisasi. Otorisasi tetap
  di Server Action, route handler, dan data layer.
- Kalau menambah matcher, jaga sesempit mungkin supaya tidak membebani
  request statis.

## 6. Struktur dan penamaan (layout repo ini)

- File: kebab-case. Komponen: PascalCase. Hook: `useXxx`.
- Satu komponen satu file. Maksimal sekitar 150 baris, pecah kalau
  lebih.
- Satu folder per fitur di `src/features/<fitur>/`: `schema.ts` (Zod),
  `repository.ts` (query DB lewat `getDb()`), `serializer.ts` (bentuk
  response API), `actions.ts` (Server Actions), `components/`.
- Komponen UI generik di `src/components/ui`, komponen per fitur di
  `src/components/<fitur>/`.
- Skema dan koneksi DB di `src/db/` (`schema/<tabel>.ts`, `index.ts`
  dengan `getDb()`); util dan konfigurasi di `src/lib/`.
- Route di `src/app/` tipis saja (`page`, `layout`, `error`,
  `not-found`, `route.ts`); logika ada di `features/` dan `lib/`.
- Import pakai alias `@/` (terdaftar di `tsconfig.json` sebagai
  `./src/*`), bukan path relatif panjang (`../../..`).
- Route yang punya parallel routes wajib punya `default.tsx` untuk
  setiap slot.

## 7. TypeScript

- Strict mode aktif (terverifikasi di `tsconfig.json`). Dilarang `any`;
  pakai `unknown` lalu persempit tipenya.
- Tipe data dari Zod schema (`z.infer`), jangan menulis tipe ganda.
- Props komponen pakai type eksplisit.
- Tipe row dari ORM (mis. `$inferSelect` di Drizzle) dipakai di layer
  server saja. Ke client kirim tipe turunan yang sudah dipilih kolomnya.

Praktisnya: skema Zod adalah satu-satunya sumber kebenaran untuk input.
Jangan menulis interface terpisah yang bisa menyimpang dari skema.

## 8. UI dan performa

- Gambar pakai next/image, link internal pakai next/link, font pakai
  next/font.
- Domain gambar eksternal didaftarkan lewat images.remotePatterns
  (bukan images.domains, sudah deprecated). Jangan tambah host baru
  tanpa mengubah `next.config.ts` dan mencatatnya di PR.
  next/legacy/image sudah dihapus.
- Pakai Suspense + loading.tsx untuk data yang lambat.
- Setiap route punya error.tsx (wajib Client Component), dan
  not-found.tsx bila relevan. Pertimbangkan global-error.tsx di root.
- Aksesibilitas: label pada input, alt pada gambar, elemen semantik
  (button, nav, main).
- Pakai Tailwind. Jangan buat CSS custom kalau utility sudah cukup.
  Repo ini memakai Tailwind v4 (dikonfigurasi lewat CSS, bukan
  tailwind.config v3).
- Turbopack adalah bundler default untuk dev dan build. Jangan
  menambahkan konfigurasi webpack kecuali ada alasan yang ditulis.
- Cek `next.config.ts` sebelum berasumsi soal flag compiler atau optimasi.
- Hindari useEffect untuk data yang bisa dihitung saat render atau
  diambil di server.

## 9. Keamanan

- Env yang rahasia tanpa prefix NEXT_PUBLIC_. Jangan pernah expose
  secret ke client. Kunci layanan hanya dipakai di server.
- Jangan render HTML mentah dari user (dangerouslySetInnerHTML). Kalau
  terpaksa, sanitasi dulu dan jelaskan alasannya.
- Endpoint API dan Server Action yang sensitif wajib pakai otorisasi
  yang berlaku di repo ini.
- Jangan log token, API key, atau data pribadi.
- Jangan membaca process.env langsung di banyak tempat. Kalau menambah
  env baru, daftarkan namanya saja di `.env.example` tanpa nilai, dan
  baca dari `src/lib/env.ts` (publik, NEXT_PUBLIC_*) atau
  `src/lib/server-env.ts` (rahasia server). Jangan mengarang modul env
  yang belum ada seolah sudah ada.

## 10. Dilarang

- Jangan pakai Pages Router (pages/) dan jangan campur dengan App
  Router.
- Jangan membuat middleware.ts baru. Pakai proxy.ts.
- Jangan menjalankan next lint (sudah dihapus di 16). Lint di repo ini
  pakai `npm run lint` (Biome). Repo ini TIDAK memakai ESLint, jangan
  menambah config ESLint.
- Jangan membuat komponen baru kalau yang serupa sudah ada. Cek dulu
  `src/components/`.
- Jangan tinggalkan console.log dan kode yang dikomentari.
- Jangan menambah dependency baru kalau library yang sudah terpasang
  cukup. Sebutkan alasannya bila menambah.

## 11. Checklist sebelum menyatakan selesai

Jalankan yang tersedia di repo ini dan laporkan hasilnya apa adanya:

1. `npm run check` hijau (Biome + typecheck + test).
2. `npm run build` berhasil, terutama bila perubahan menyentuh routing,
   caching, atau config. Laporkan error tipe apa adanya, jangan
   disembunyikan.
3. Setiap Server Action baru: urutan otorisasi (kalau ada) → Zod →
   mutasi → invalidasi terpenuhi.
4. Tidak ada secret di kode klien, tidak ada console.log, tidak ada
   kode yang dikomentari.
5. Tidak ada file baru yang seharusnya tidak ikut (mis. file `.env`
   asli, folder `.next/`).
6. Jika ada aturan yang sengaja dilanggar, tulis alasannya di
   ringkasan atau PR.
