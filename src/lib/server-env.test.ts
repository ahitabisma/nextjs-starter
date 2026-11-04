import { describe, expect, it } from "vitest";
import { parseServerEnv } from "./server-env";

describe("parseServerEnv", () => {
  it("menerima URL PostgreSQL", () => {
    const env = parseServerEnv({ DATABASE_URL: "postgres://u:p@localhost:5432/app" });
    expect(env.DATABASE_URL).toBe("postgres://u:p@localhost:5432/app");
  });

  it("menolak jika DATABASE_URL tidak ada", () => {
    expect(() => parseServerEnv({})).toThrow();
  });

  it("menolak protokol selain PostgreSQL", () => {
    expect(() => parseServerEnv({ DATABASE_URL: "mysql://localhost/app" })).toThrow();
  });
});
