import { describe, expect, it } from "vitest";
import { createTask, deleteTask, getTask, listTasks, toggleTask, updateTask } from "./repository";

// Database (PGlite) dikosongkan otomatis sebelum tiap test — lihat src/test/setup.ts.
const UNKNOWN_ID = "00000000-0000-4000-8000-000000000000";

describe("task repository", () => {
  it("membuat task baru dengan done=false dan timestamp", async () => {
    const task = await createTask({ title: "Belajar Next.js" });
    expect(task).toMatchObject({ title: "Belajar Next.js", done: false });
    expect(task.createdAt).toBeInstanceOf(Date);
    expect(await getTask(task.id)).toEqual(task);
  });

  it("list menampilkan task terbaru lebih dulu beserta total", async () => {
    await createTask({ title: "Pertama" });
    await createTask({ title: "Kedua" });
    const { items, total } = await listTasks({ limit: 10, offset: 0 });
    expect(items.map((task) => task.title)).toEqual(["Kedua", "Pertama"]);
    expect(total).toBe(2);
  });

  it("list mendukung limit/offset tanpa mengubah total", async () => {
    for (const title of ["A", "B", "C"]) {
      await createTask({ title });
    }
    const { items, total } = await listTasks({ limit: 1, offset: 1 });
    expect(items.map((task) => task.title)).toEqual(["B"]);
    expect(total).toBe(3);
  });

  it("list bisa difilter berdasarkan done", async () => {
    const task = await createTask({ title: "Selesai" });
    await createTask({ title: "Belum" });
    await updateTask(task.id, { done: true });
    const { items, total } = await listTasks({ limit: 10, offset: 0, done: true });
    expect(items.map((item) => item.title)).toEqual(["Selesai"]);
    expect(total).toBe(1);
  });

  it("update hanya mengubah field yang dikirim dan memperbarui updatedAt", async () => {
    const task = await createTask({ title: "Lama" });
    const updated = await updateTask(task.id, { done: true });
    expect(updated).toMatchObject({ title: "Lama", done: true });
    expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(task.updatedAt.getTime());
  });

  it("toggle membalik status done", async () => {
    const task = await createTask({ title: "Toggle" });
    expect((await toggleTask(task.id))?.done).toBe(true);
    expect((await toggleTask(task.id))?.done).toBe(false);
  });

  it("delete mengembalikan true jika ada, false jika tidak", async () => {
    const task = await createTask({ title: "Hapus aku" });
    expect(await deleteTask(task.id)).toBe(true);
    expect(await deleteTask(task.id)).toBe(false);
  });

  it("id yang tidak ada atau bukan UUID diperlakukan sebagai tidak ditemukan", async () => {
    expect(await getTask(UNKNOWN_ID)).toBeUndefined();
    expect(await getTask("bukan-uuid")).toBeUndefined();
    expect(await updateTask("bukan-uuid", { done: true })).toBeUndefined();
    expect(await toggleTask("bukan-uuid")).toBeUndefined();
    expect(await deleteTask("bukan-uuid")).toBe(false);
  });
});
