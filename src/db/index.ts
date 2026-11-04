import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { Pool } from "pg";
import { getServerEnv } from "@/lib/server-env";
import * as schema from "./schema";

/**
 * Tipe database yang dipakai repository. Dibuat generik (bukan NodePgDatabase) agar test
 * bisa memakai PGlite (Postgres in-process) tanpa mengubah kode aplikasi.
 */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

// Disimpan di globalThis agar Pool tidak dibuat ulang tiap hot reload di mode dev.
const globalForDb = globalThis as typeof globalThis & { database?: Database };

function createDatabase(): Database {
  const pool = new Pool({ connectionString: getServerEnv().DATABASE_URL, max: 10 });
  return drizzle({ client: pool, schema, casing: "snake_case" });
}

/** Satu-satunya pintu masuk ke database. Dipanggil dari repository, bukan dari page/komponen. */
export function getDb(): Database {
  globalForDb.database ??= createDatabase();
  return globalForDb.database;
}
