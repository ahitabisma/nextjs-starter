import { describe, expect, it } from "vitest";
import { createTask, getTask } from "@/features/tasks/repository";
import { DELETE, GET, PATCH } from "./route";

type Context = Parameters<typeof GET>[1];

const contextFor = (id: string) => ({ params: Promise.resolve({ id }) }) as Context;
const UNKNOWN_ID = "00000000-0000-4000-8000-000000000000";

function patchRequest(body: string): Request {
  return new Request("http://localhost/api/tasks/x", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body,
  });
}

const anyRequest = new Request("http://localhost/api/tasks/x");

describe("GET /api/tasks/:id", () => {
  it("mengembalikan { data } untuk task yang ada", async () => {
    const task = await createTask({ title: "Ada" });
    const response = await GET(anyRequest, contextFor(task.id));
    expect(response.status).toBe(200);
    expect((await response.json()).data).toMatchObject({ id: task.id, title: "Ada" });
  });

  it("404 problem+json untuk id yang tidak ada", async () => {
    const response = await GET(anyRequest, contextFor(UNKNOWN_ID));
    const body = await response.json();
    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toBe("application/problem+json");
    expect(body).toMatchObject({ type: "about:blank", title: "Not Found", status: 404 });
    expect(body.detail).toContain(UNKNOWN_ID);
  });

  it("404 (bukan 500) untuk id yang bukan UUID", async () => {
    const response = await GET(anyRequest, contextFor("bukan-uuid"));
    expect(response.status).toBe(404);
  });
});

describe("PATCH /api/tasks/:id", () => {
  it("mengubah field yang dikirim", async () => {
    const task = await createTask({ title: "Lama" });
    const response = await PATCH(patchRequest('{"done":true}'), contextFor(task.id));
    expect(response.status).toBe(200);
    expect(await getTask(task.id)).toMatchObject({ title: "Lama", done: true });
  });

  it("422 untuk body kosong", async () => {
    const task = await createTask({ title: "Lama" });
    const response = await PATCH(patchRequest("{}"), contextFor(task.id));
    const body = await response.json();
    expect(response.status).toBe(422);
    expect(body.errors[0].pointer).toBe("#");
  });

  it("400 untuk JSON rusak", async () => {
    const task = await createTask({ title: "Lama" });
    const response = await PATCH(patchRequest("{rusak"), contextFor(task.id));
    expect(response.status).toBe(400);
  });

  it("404 untuk id yang tidak ada", async () => {
    const response = await PATCH(patchRequest('{"done":true}'), contextFor(UNKNOWN_ID));
    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/tasks/:id", () => {
  it("204 tanpa body dan task benar-benar hilang", async () => {
    const task = await createTask({ title: "Hapus" });
    const response = await DELETE(anyRequest, contextFor(task.id));
    expect(response.status).toBe(204);
    expect(await getTask(task.id)).toBeUndefined();
  });

  it("404 jika sudah tidak ada", async () => {
    const response = await DELETE(anyRequest, contextFor(UNKNOWN_ID));
    expect(response.status).toBe(404);
  });
});
