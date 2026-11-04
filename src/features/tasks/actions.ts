"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createTask, deleteTask, toggleTask } from "./repository";
import { type CreateTaskState, taskInputSchema } from "./schema";

// PENTING: Server Action bisa dipanggil langsung lewat POST, bukan hanya dari UI.
// Saat aplikasi punya autentikasi, cek session & kepemilikan resource di setiap action.

export async function createTaskAction(
  _previousState: CreateTaskState,
  formData: FormData,
): Promise<CreateTaskState> {
  const parsed = taskInputSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  await createTask(parsed.data);
  revalidatePath("/tasks");
  return {};
}

export async function toggleTaskAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (typeof id !== "string") {
    return;
  }
  const task = await toggleTask(id);
  if (!task) {
    return;
  }
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${id}`);
}

export async function deleteTaskAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (typeof id !== "string") {
    return;
  }
  await deleteTask(id);
  revalidatePath("/tasks");
  redirect("/tasks");
}
