import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import type { Database } from "@/db";

// `server-only` melempar error di luar bundler Next.js; di test dibuat no-op.
vi.mock("server-only", () => ({}));

// `connection()` hanya valid di dalam request Next.js; di unit test dibuat no-op.
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  connection: vi.fn(async () => {}),
}));

// Setiap test file yang meng-import `@/db` otomatis memakai PGlite (bukan Postgres sungguhan).
// Tabel dikosongkan otomatis sebelum SETIAP test, jadi test tidak perlu menyiapkan/membersihkan DB sendiri.
let testDb: Database | undefined;

vi.mock("@/db", async () => {
  const { createTestDb } = await import("./db");
  testDb = (await createTestDb()) as unknown as Database;
  return { getDb: () => testDb };
});

beforeEach(async () => {
  if (testDb) {
    const { resetDatabase } = await import("./db");
    await resetDatabase(testDb);
  }
});

afterEach(() => {
  cleanup();
});
