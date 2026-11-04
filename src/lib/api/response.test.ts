import { describe, expect, it } from "vitest";
import { created, list, noContent, ok } from "./response";

describe("response helpers", () => {
  it("ok → 200 { data } dan no-store", async () => {
    const response = ok({ id: 1 });
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ data: { id: 1 } });
  });

  it("list → { data, meta }", async () => {
    const response = list([1, 2], { total: 10, limit: 2, offset: 0 });
    expect(await response.json()).toEqual({
      data: [1, 2],
      meta: { total: 10, limit: 2, offset: 0 },
    });
  });

  it("created → 201 dengan header Location", async () => {
    const response = created({ id: "a" }, "/api/things/a");
    expect(response.status).toBe(201);
    expect(response.headers.get("location")).toBe("/api/things/a");
  });

  it("noContent → 204 tanpa body", async () => {
    const response = noContent();
    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
  });
});
