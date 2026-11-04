import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getTask } from "@/features/tasks/repository";
import { TaskDetailView } from "./task-detail-view";

/**
 * Async Server Component tipis untuk halaman detail. `params` adalah Promise dan merupakan
 * runtime data, jadi komponen ini harus dibungkus <Suspense> oleh page-nya.
 */
export async function TaskDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connection();
  const task = await getTask(id);
  if (!task) {
    notFound();
  }
  return <TaskDetailView task={task} />;
}
