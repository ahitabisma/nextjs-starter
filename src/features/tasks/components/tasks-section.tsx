import { connection } from "next/server";
import { listTasks } from "@/features/tasks/repository";
import { TaskList } from "./task-list";

/**
 * Async Server Component tipis: hanya mengambil data lalu menyerahkannya ke komponen presentasi.
 * `connection()` menandai data ini per-request (bukan di-prerender), jadi bungkus dengan <Suspense>.
 * Tidak dites unit (Vitest belum mendukung async Server Component); logikanya ada di repository & TaskList.
 */
export async function TasksSection() {
  await connection();
  const { items } = await listTasks({ limit: 50, offset: 0 });
  return <TaskList tasks={items} />;
}
