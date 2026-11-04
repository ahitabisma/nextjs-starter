import { describe, expect, it } from "vitest";
import { createTask } from "@/features/tasks/repository";
import { GET, POST } from "./route";

const url = "http://localhost/api/tasks";

function postRequest(
  body: string,
  headers: Record<string, string> = { "content-type": "application/json" },
) {
  return new Request(url, { method: "POST", headers, body });
}

describe("GET /api/tasks", () => {
  it("mengembalikan { data: [], meta } saat belum ada task", async () => {
    const response = await GET(new Request(url), undefined);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: [], meta: { total: 0, limit: 20, offset: 0 } });
  });

  it("mengembalikan task dalam bentuk response publik (ISO string) beserta meta pagination", async () => {
    await createTask({ title: "Satu" });
    await createTask({ title: "Dua" });
    const response = await GET(new Request(`${url}?limit=1`), undefined);
    const body = await response.json();
    expect(body.meta).toEqual({ total: 2, limit: 1, offset: 0 });
    expect(body.data).toHaveLength(1);
    expect(body.data[0]).toMatchObject({ title: "Dua", done: false });
    expect(body.data[0].createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("mendukung filter done", async () => {
    await createTask({ title: "Belum" });
    const response = await GET(new Request(`${url}?done=true`), undefined);
    expect((await response.json()).meta.total).toBe(0);
  });

  it("400 problem+json dengan nama parameter untuk query yang tidak valid", async () => {
    const response = await GET(new Request(`${url}?limit=1000`), undefined);
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(response.headers.get("content-type")).toBe("application/problem+json");
    expect(body.errors[0]).toMatchObject({ parameter: "limit" });
  });

  it("selalu menyertakan X-Request-Id dan Cache-Control: no-store", async () => {
    const response = await GET(new Request(url), undefined);
    expect(response.headers.get("x-request-id")).toBeTruthy();
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});

describe("POST /api/tasks", () => {
  it("201 dengan header Location dan body { data }", async () => {
    const response = await POST(postRequest(JSON.stringify({ title: "Baru" })), undefined);
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.data).toMatchObject({ title: "Baru", done: false });
    expect(response.headers.get("location")).toBe(`/api/tasks/${body.data.id}`);
  });

  it("422 problem+json dengan JSON Pointer saat validasi gagal", async () => {
    const response = await POST(postRequest(JSON.stringify({ title: "" })), undefined);
    const body = await response.json();
    expect(response.status).toBe(422);
    expect(body).toMatchObject({
      type: "/problems/validation-error",
      title: "Validation failed",
      status: 422,
      instance: "/api/tasks",
    });
    expect(body.errors).toEqual([{ detail: "Judul wajib diisi", pointer: "#/title" }]);
    expect(body.requestId).toBe(response.headers.get("x-request-id"));
  });

  it("400 untuk JSON rusak", async () => {
    const response = await POST(postRequest("{rusak"), undefined);
    expect(response.status).toBe(400);
  });

  it("415 jika Content-Type bukan JSON", async () => {
    const response = await POST(
      postRequest("title=a", { "content-type": "text/plain" }),
      undefined,
    );
    expect(response.status).toBe(415);
  });
});
