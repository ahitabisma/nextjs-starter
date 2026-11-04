# Next.js + Biome + Vitest + Drizzle Boilerplate

Next.js 16 (App Router, Turbopack, Tailwind v4) dengan Biome (lint/format), Zod 4, Drizzle ORM + PostgreSQL,
dan Vitest + Testing Library. Test database memakai PGlite sehingga **tidak butuh Docker** untuk `npm run test`.
Aturan proyek untuk AI/kontributor ada di [AGENTS.md](./AGENTS.md).

## Mulai
```bash
nvm use                      # Node 22 (minimal 20.9)
npm install
cp .env.example .env.local
docker compose up -d         # PostgreSQL lokal
npm run db:migrate           # terapkan migrasi
npm run dev
```

## Script
| Perintah | Fungsi |
| --- | --- |
| `npm run check` | lint + typecheck + test (jalankan sebelum commit) |
| `npm run lint` / `lint:fix` / `format` | Biome |
| `npm run typecheck` | `next typegen` + `tsc --noEmit` |
| `npm run test` / `test:watch` / `test:coverage` | Vitest |
| `npm run db:generate` | buat migrasi SQL dari perubahan `src/db/schema` |
| `npm run db:migrate` | terapkan migrasi ke `DATABASE_URL` |
| `npm run db:push` / `db:studio` | sinkron cepat (dev saja) / Drizzle Studio |
| `npm run ci` | versi CI (`biome ci` + typecheck + test) |

## Struktur
```
drizzle/                  migrasi SQL (hasil db:generate, di-commit)
src/
  app/                    route tipis: page, error, not-found, route.ts (+ test)
    tasks/                contoh halaman: list + form, detail [id], error, not-found
    api/tasks/            contoh REST API: GET/POST + GET/PATCH/DELETE per id
    api/health/           health check
  db/                     schema/ (tabel Drizzle) dan getDb()
  features/tasks/         schema (drizzle-zod), repository, serializer, actions, components (+ test)
  components/ui/          komponen generik (+ test)
  lib/                    env, server-env, utils, format
  lib/api/                toolkit API: route(), ApiError, response helpers, validate
  test/                   setup Vitest + PGlite
```

## Kontrak response API
Semua endpoint memakai bentuk yang sama (detail & aturan di [AGENTS.md](./AGENTS.md)).

```jsonc
// GET /api/tasks?limit=2&offset=0&done=false      → 200
{ "data": [{ "id": "…", "title": "Belajar", "done": false,
             "createdAt": "2026-11-04T08:55:42.010Z", "updatedAt": "2026-11-04T08:55:42.010Z" }],
  "meta": { "total": 7, "limit": 2, "offset": 0 } }

// POST /api/tasks  {"title":"Baru"}               → 201  + header  Location: /api/tasks/<id>
{ "data": { "id": "…", "title": "Baru", "done": false, "createdAt": "…", "updatedAt": "…" } }

// DELETE /api/tasks/<id>                          → 204 (tanpa body)

// POST /api/tasks  {"title":""}                   → 422  application/problem+json (RFC 9457)
{ "type": "/problems/validation-error", "title": "Validation failed", "status": 422,
  "detail": "Satu atau lebih field tidak valid.", "instance": "/api/tasks",
  "requestId": "9986281a-…",
  "errors": [{ "detail": "Judul wajib diisi", "pointer": "#/title" }] }
```
Setiap response juga membawa `X-Request-Id` dan `Cache-Control: no-store`.

## Catatan
- Drizzle yang dipakai adalah rilis stabil (`0.45.x`); v1 masih RC. Saat v1 stabil, `drizzle-zod` pindah ke `drizzle-orm/zod`.
- Untuk serverless (Neon/Supabase), pakai connection string pooled atau ganti driver di `src/db/index.ts`; repository tidak perlu diubah.
- Untuk tabel besar, ganti pagination offset dengan keyset/cursor.

## Pakai sebagai template
Repo ini ditandai sebagai GitHub template. Untuk mulai proyek baru dari template ini:

```bash
# lewat GitHub CLI (repo baru private + langsung clone)
gh repo create <nama-proyek-baru> --template ahitabisma/nextjs-biome-starter --private --clone

# atau lewat web: buka repo ini → tombol "Use this template" → "Create a new repository"
```

Setelah itu tinggal ganti nama di `package.json`, isi `.env.local` dari `.env.example`, dan ikuti
aturan di [AGENTS.md](./AGENTS.md).
