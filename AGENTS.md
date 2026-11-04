# Aturan untuk AI & kontributor

Ikuti pola kode yang SUDAH ADA. Fitur contoh lengkap: **`src/features/tasks/`** + `src/app/tasks/**` + `src/app/api/tasks/**` + `src/db/schema/tasks.ts`.
Untuk fitur baru, salin pola itu (struktur, penamaan, cara test).

## Agent skills

### Next.js guideline

Sebelum menulis, mengubah, atau me-review kode Next.js apa pun di repo
ini, agent WAJIB membaca dan mengikuti:

`.agents/skills/next-js-guideline/SKILL.md`

Skill itu berisi aturan wajib App Router Next.js 16 untuk repo ini:
Server vs Client Component, API async, Server Action (otorisasi →
validasi Zod → mutasi → invalidasi cache), caching eksplisit, proxy.ts,
struktur folder repo ini, TypeScript strict, Tailwind v4, dan keamanan
env.

Aturan ini mengikat, bukan saran opsional. Kalau sebuah aturan di skill
bertentangan dengan perintah terbaru Bisma (pemilik repo), perintah
Bisma menang, tapi agent wajib menyebutkan pertentangan itu secara
eksplisit di ringkasan atau PR. Jangan diam-diam mengabaikan skill,
jangan mengarang helper, folder, atau modul yang belum ada seolah
sudah ada, dan jangan menyalin aturan domain dari repo lain ke repo ini.

## Wajib sebelum selesai
Jalankan `npm run check` (biome + typecheck + test). Harus hijau. Jangan matikan rule Biome
atau pakai `biome-ignore` tanpa alasan tertulis di komentar.

## Stack
Next.js 16 (App Router) · TypeScript strict · Tailwind v4 · Biome (lint+format) · Zod 4 ·
Drizzle ORM + PostgreSQL (driver `pg`) · drizzle-zod · Vitest + Testing Library (DB test: PGlite).

## Perintah
- `npm run dev` / `build` / `start`
- `npm run lint` · `lint:fix` · `format` (Biome, pengganti ESLint + Prettier — jangan tambah ESLint/Prettier)
- `npm run typecheck` · `npm run test` · `test:watch` · `test:coverage`
- `npm run db:generate` (buat migrasi dari perubahan schema) · `db:migrate` · `db:push` (hanya dev lokal) · `db:studio`
- DB lokal: `docker compose up -d`, salin `.env.example` → `.env.local`, lalu `npm run db:migrate`.

## Struktur
- `src/app/` — route Next.js saja: `page`, `layout`, `error`, `not-found`, `route.ts`. Tipis; logika ada di `features/` & `lib/`.
- `src/features/<fitur>/` — satu folder per fitur: `schema.ts` (zod), `repository.ts` (query DB), `serializer.ts` (bentuk response API), `actions.ts` (Server Actions), `components/`.
- `src/db/` — `schema/<tabel>.ts` (definisi tabel Drizzle, didaftarkan di `schema/index.ts`) dan `index.ts` (`getDb()`).
- `src/components/ui/` — komponen UI generik. `src/components/<fitur>/` — komponen per fitur.
- `src/lib/` — util murni & konfigurasi: `env.ts` (NEXT_PUBLIC_*), `server-env.ts` (rahasia server), `api/*` (toolkit API), `utils.ts`, `format.ts`.
- `drizzle/` — file migrasi hasil `db:generate`. JANGAN edit manual; di-commit ke git.
- `src/test/` — setup & helper test. Jangan taruh test di sini.
- Alias import: `@/*` → `src/*`. Pakai alias, bukan path relatif naik (`../../`).

## Konvensi kode
- TypeScript strict. DILARANG `any` dan non-null assertion (`!`). Pakai `unknown` + narrowing.
- Nama file `kebab-case` (diwajibkan Biome). Komponen: named export `PascalCase`.
- Default export HANYA untuk file konvensi Next (`page`, `layout`, `error`, `loading`, `not-found`, `*.config.*`).
- `import type` untuk import yang hanya tipe. Import Node pakai prefix `node:`.
- Default-nya Server Component. Tambah `"use client"` hanya jika butuh state/effect/event handler, dan di komponen daun sekecil mungkin.
- Styling: Tailwind. Gabungkan class dengan `cn()` dari `@/lib/utils`.
- Jangan `console.log` (boleh `console.error`/`warn`). Jangan `forEach` — pakai `for...of`/`map`.

## Env
- Variabel publik (`NEXT_PUBLIC_*`) divalidasi di `src/lib/env.ts`; rahasia server (mis. `DATABASE_URL`) di `src/lib/server-env.ts` (lazy, `server-only`).
- Daftarkan setiap variabel baru di file env yang sesuai DAN di `.env.example`. Jangan baca `process.env` di tempat lain.

## Database (Drizzle)
- Definisikan tabel di `src/db/schema/<tabel>.ts`, export dari `src/db/schema/index.ts`. Nama kolom di TS camelCase → di DB otomatis snake_case.
- Ubah schema → `npm run db:generate` → commit file di `drizzle/`. Jangan pakai `db:push` untuk production.
- Query HANYA di `features/<fitur>/repository.ts` lewat `getDb()`. Page/komponen/action/route memanggil fungsi repository, bukan query langsung.
- Tipe baris: `typeof tabel.$inferSelect`. Validasi input diturunkan dari tabel dengan drizzle-zod (`createInsertSchema`/`createUpdateSchema`) lalu diperketat dengan Zod (lihat `features/tasks/schema.ts`). Meng-override kolom dengan schema Zod menimpa sifat opsionalnya.
- Query yang menerima `id` dari luar harus memvalidasi format (UUID) dulu; id yang salah bentuk = "tidak ditemukan", bukan error 500.
- Update yang bergantung pada nilai sebelumnya (toggle, increment) dikerjakan atomik di SQL, bukan baca-lalu-tulis.

## Kontrak response API (WAJIB seragam)
Semua route handler dibungkus `route()` dari `@/lib/api/route` dan memakai helper di `@/lib/api/*`. Handler hanya mengembalikan response sukses; kegagalan di-`throw` sebagai `ApiError` (`notFound()`, `badRequest()`, ...).

| Kasus | Status | Bentuk |
| --- | --- | --- |
| Satu resource | 200 | `{ "data": {...} }` |
| Koleksi | 200 | `{ "data": [...], "meta": { "total", "limit", "offset" } }` |
| Buat resource | 201 | `{ "data": {...} }` + header `Location` |
| Hapus | 204 | tanpa body |
| Body bukan JSON / query salah | 400 | problem |
| Content-Type bukan JSON | 415 | problem |
| Tidak ditemukan | 404 | problem |
| Validasi body gagal | 422 | problem + `errors[]` |
| Error tak terduga | 500 | problem generik (detail hanya di log) |

- Error memakai **RFC 9457** (`Content-Type: application/problem+json`): `type`, `title`, `status`, `detail`, `instance` (path), `requestId`. Validasi menambah `errors: [{ detail, pointer }]` (JSON Pointer ke field body, mis. `#/title`) atau `{ detail, parameter }` untuk query.
- `type: "about:blank"` untuk error yang cukup dijelaskan status HTTP-nya; jenis khusus memakai URI (contoh `/problems/validation-error`).
- Setiap response punya `X-Request-Id` (dipakai ulang dari request jika formatnya aman) dan `Cache-Control: no-store`.
- Response publik dibentuk lewat serializer (`toTaskResponse`): tanggal ISO 8601, hanya field yang sengaja diekspos. Jangan mengembalikan baris database mentah.
- Body & query divalidasi dengan `parseJsonBody(request, schema)` / `parseQuery(request, schema)`. Query pagination: `limit` (default 20, maks 100) dan `offset`.
- `route()` membaca `request.url`, sehingga handler `GET` otomatis berjalan per-request (tidak di-prerender).
- Jangan menulis `try/catch` yang menelan error di handler; biarkan `route()` yang menangani. Jika perlu `catch`, panggil `unstable_rethrow(error)` dulu.

## Pola fitur (lihat `src/features/tasks/`)
- **Schema dulu:** `schema.ts` berisi zod schema + tipe. Dipakai bersama oleh Server Action, route handler, dan form. Pesan validasi dalam Bahasa Indonesia.
- **Halaman = susunan tipis.** `page.tsx` sinkron, membungkus komponen async dengan `<Suspense>` (wajib karena `cacheComponents`).
- **Pisahkan async dari presentasi:** komponen async tipis (`tasks-section.tsx`, `task-detail.tsx`: `await connection()` / `await params`, ambil data, `notFound()`) + komponen presentasi murni (`task-list.tsx`, `task-detail-view.tsx`) yang dites unit.
- **Mutasi lewat Server Action** (`actions.ts`, `"use server"`): validasi dengan zod → panggil repository → `revalidatePath`. Form interaktif memakai `useActionState` (lihat `task-form.tsx`). Cek auth di setiap action begitu ada autentikasi.
- **Error UI:** `error.tsx` memakai props `{ error, retry }` (Next 16, bukan `reset`); `not-found.tsx` per segmen.

## Testing (Vitest + Testing Library)
- Test di sebelah file-nya: `nama.ts` → `nama.test.ts(x)`. Jalankan `npm run test`.
- **`*.test.ts` jalan di Node, `*.test.tsx` di jsdom** (diatur di `vitest.config.mts`). Tidak perlu docblock environment.
- Import `describe/it/expect/vi` dari `vitest` secara eksplisit (tidak ada globals).
- **Database:** modul `@/db` otomatis diganti PGlite (Postgres in-process, migrasi dari `drizzle/` dijalankan) dan semua tabel dikosongkan sebelum TIAP test (`src/test/setup.ts`). Cukup panggil repository/route/action secara langsung; jangan mock `@/db` atau repository untuk test logika data. Tidak butuh Docker/Postgres untuk `npm run test`.
- Schema berubah → jalankan `npm run db:generate` dulu, kalau tidak test DB memakai migrasi lama.
- Komponen: query lewat role/label (`getByRole`), interaksi lewat `userEvent`. Hindari test detail implementasi. Mock Server Action dengan `vi.mock("@/features/<fitur>/actions")`.
- Test Server Action: panggil fungsinya langsung dengan `FormData`; mock `next/cache` dan `next/navigation`. `connection()` dan `server-only` sudah di-mock global.
- Test route handler: panggil `GET/POST/...` (hasil `route()`) dengan `Request` dan context `{ params: Promise.resolve({...}) }`. Periksa status, header, dan bentuk body sesuai kontrak di atas.
- Async Server Component tidak bisa dites unit di Vitest — ekstrak logikanya ke repository/komponen presentasi (lihat pola fitur), atau tes lewat E2E.
- Setiap fitur/fungsi baru WAJIB punya test. Bug fix WAJIB disertai test yang gagal sebelum diperbaiki.

## Next.js 16
API Next.js berubah dari data latihan model. Sebelum memakai API Next, baca dokumen versi terpasang di
`node_modules/next/dist/docs/`. Template ini memakai `cacheComponents` dan `partialPrefetching`
(lihat `next.config.ts`); ikuti panduan caching di dokumen tersebut.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
