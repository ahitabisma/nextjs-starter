import { describe, expect, it } from "vitest";
import { listTasksQuerySchema, taskInputSchema, taskPatchSchema } from "./schema";

describe("taskInputSchema", () => {
  it("men-trim judul", () => {
    expect(taskInputSchema.parse({ title: "  Belajar  " })).toEqual({ title: "Belajar" });
  });

  it("menolak judul kosong atau hanya spasi", () => {
    expect(taskInputSchema.safeParse({ title: "   " }).success).toBe(false);
  });

  it("menolak judul lebih dari 100 karakter", () => {
    expect(taskInputSchema.safeParse({ title: "a".repeat(101) }).success).toBe(false);
  });

  it("mengabaikan field yang tidak boleh diisi klien (id, done)", () => {
    const parsed = taskInputSchema.parse({ title: "A", id: "x", done: true });
    expect(parsed).toEqual({ title: "A" });
  });
});

describe("taskPatchSchema", () => {
  it("menerima salah satu field", () => {
    expect(taskPatchSchema.safeParse({ done: true }).success).toBe(true);
  });

  it("menolak objek kosong", () => {
    expect(taskPatchSchema.safeParse({}).success).toBe(false);
  });

  it("menolak tipe done yang salah", () => {
    expect(taskPatchSchema.safeParse({ done: "ya" }).success).toBe(false);
  });
});

describe("listTasksQuerySchema", () => {
  it("memakai default limit=20 offset=0", () => {
    expect(listTasksQuerySchema.parse({})).toEqual({ limit: 20, offset: 0 });
  });

  it("meng-coerce string ke angka dan boolean", () => {
    expect(listTasksQuerySchema.parse({ limit: "5", offset: "10", done: "true" })).toEqual({
      limit: 5,
      offset: 10,
      done: true,
    });
  });

  it("menolak limit di atas 100", () => {
    expect(listTasksQuerySchema.safeParse({ limit: "101" }).success).toBe(false);
  });

  it("menolak nilai done selain true/false", () => {
    expect(listTasksQuerySchema.safeParse({ done: "mungkin" }).success).toBe(false);
  });
});
