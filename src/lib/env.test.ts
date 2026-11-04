import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

describe("parseEnv", () => {
  it("memakai default saat variabel tidak diisi", () => {
    expect(parseEnv({}).NEXT_PUBLIC_APP_NAME).toBe("Next Boilerplate");
  });

  it("menolak nilai kosong", () => {
    expect(() => parseEnv({ NEXT_PUBLIC_APP_NAME: "" })).toThrow();
  });
});
