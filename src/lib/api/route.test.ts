import { describe, expect, it, vi } from "vitest";
import { notFound } from "./errors";
import { ok } from "./response";
import { route } from "./route";

const request = (headers?: Record<string, string>) =>
  new Request("http://localhost/api/demo?x=1", { headers });

describe("route()", () => {
  it("meneruskan response sukses dan menambahkan X-Request-Id", async () => {
    const response = await route(() => ok({ hello: "dunia" }))(request(), undefined);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { hello: "dunia" } });
    expect(response.headers.get("x-request-id")).toMatch(/^[\w-]{8,}$/);
  });

  it("memakai X-Request-Id dari klien jika formatnya aman", async () => {
    const response = await route(() => ok(1))(request({ "x-request-id": "abc-123" }), undefined);
    expect(response.headers.get("x-request-id")).toBe("abc-123");
  });

  it("mengganti X-Request-Id yang tidak aman", async () => {
    const response = await route(() => ok(1))(request({ "x-request-id": "bad id!" }), undefined);
    expect(response.headers.get("x-request-id")).not.toBe("bad id!");
  });

  it("mengubah ApiError menjadi problem+json (RFC 9457)", async () => {
    const response = await route(() => {
      throw notFound("Tidak ada");
    })(request({ "x-request-id": "req-1" }), undefined);

    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toBe("application/problem+json");
    expect(await response.json()).toEqual({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: "Tidak ada",
      instance: "/api/demo",
      requestId: "req-1",
    });
  });

  it("error tak terduga → 500 generik tanpa membocorkan detail", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await route(() => {
      throw new Error("password database: rahasia");
    })(request(), undefined);

    const body = await response.json();
    expect(response.status).toBe(500);
    expect(body.title).toBe("Internal Server Error");
    expect(JSON.stringify(body)).not.toContain("rahasia");
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
