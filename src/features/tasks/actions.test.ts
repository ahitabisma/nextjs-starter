import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTaskAction, deleteTaskAction, toggleTaskAction } from "./actions";
import { createTask, getTask, listTasks } from "./repository";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

function formDataOf(values: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
}

const allTasks = async () => (await listTasks({ limit: 100, offset: 0 })).items;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createTaskAction", () => {
  it("membuat task dan me-revalidate halaman list", async () => {
    const state = await createTaskAction({}, formDataOf({ title: "Tulis test" }));
    expect(state).toEqual({});
    expect(await allTasks()).toHaveLength(1);
    expect(revalidatePath).toHaveBeenCalledWith("/tasks");
  });

  it("mengembalikan pesan error saat judul kosong", async () => {
    const state = await createTaskAction({}, formDataOf({ title: "  " }));
    expect(state.error).toBe("Judul wajib diisi");
    expect(await allTasks()).toHaveLength(0);
  });

  it("mengembalikan pesan error saat field title tidak ada", async () => {
    const state = await createTaskAction({}, new FormData());
    expect(state.error).toBe("Judul wajib diisi");
  });
});

describe("toggleTaskAction", () => {
  it("membalik status done", async () => {
    const task = await createTask({ title: "Toggle" });
    await toggleTaskAction(formDataOf({ id: task.id }));
    expect((await getTask(task.id))?.done).toBe(true);
    await toggleTaskAction(formDataOf({ id: task.id }));
    expect((await getTask(task.id))?.done).toBe(false);
  });

  it("mengabaikan id yang tidak dikenal", async () => {
    await toggleTaskAction(formDataOf({ id: "tidak-ada" }));
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("deleteTaskAction", () => {
  it("menghapus task lalu redirect ke /tasks", async () => {
    const task = await createTask({ title: "Hapus" });
    await deleteTaskAction(formDataOf({ id: task.id }));
    expect(await getTask(task.id)).toBeUndefined();
    expect(redirect).toHaveBeenCalledWith("/tasks");
  });
});
