import { PGlite } from "@electric-sql/pglite";
import { getTableName, is, sql } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import type { Database } from "@/db";
import * as schema from "@/db/schema";

/**
 * Database test: Postgres sungguhan yang jalan di dalam proses (PGlite), tanpa Docker.
 * Migrasi dari folder `drizzle/` dijalankan, jadi test sekaligus memvalidasi file migrasi.
 */
export async function createTestDb() {
  const db = drizzle({ client: new PGlite(), schema, casing: "snake_case" });
  await migrate(db, { migrationsFolder: "./drizzle" });
  return db;
}

/** Kosongkan semua tabel yang terdaftar di `src/db/schema`. */
export async function resetDatabase(db: Database): Promise<void> {
  const tables = Object.values(schema)
    .filter((value) => is(value, PgTable))
    .map((table) => `"${getTableName(table)}"`);
  if (tables.length > 0) {
    await db.execute(sql.raw(`TRUNCATE TABLE ${tables.join(", ")} RESTART IDENTITY CASCADE`));
  }
}
