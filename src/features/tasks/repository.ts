import { count, desc, eq, not } from "drizzle-orm";
import { getDb } from "@/db";
import { tasks } from "@/db/schema";
import { type Task, type TaskInput, type TaskPatch, taskIdSchema } from "./schema";

// Satu-satunya tempat yang boleh query tabel `tasks`. Page, action, dan route handler
// memanggil fungsi di sini — jangan import `getDb`/`tasks` dari luar feature ini.

function isTaskId(id: string): boolean {
  return taskIdSchema.safeParse(id).success;
}

export type ListTasksOptions = { limit: number; offset: number; done?: boolean | undefined };

/** Task terbaru lebih dulu. `total` = jumlah seluruh baris yang cocok filter (untuk pagination). */
export async function listTasks({
  limit,
  offset,
  done,
}: ListTasksOptions): Promise<{ items: Task[]; total: number }> {
  const db = getDb();
  const where = done === undefined ? undefined : eq(tasks.done, done);

  const [items, totals] = await Promise.all([
    db
      .select()
      .from(tasks)
      .where(where)
      .orderBy(desc(tasks.createdAt), desc(tasks.id))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(tasks).where(where),
  ]);

  return { items, total: totals[0]?.total ?? 0 };
}

export async function getTask(id: string): Promise<Task | undefined> {
  if (!isTaskId(id)) {
    return undefined;
  }
  const [task] = await getDb().select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return task;
}

export async function createTask(input: TaskInput): Promise<Task> {
  const [task] = await getDb().insert(tasks).values(input).returning();
  if (!task) {
    throw new Error("Insert tasks tidak mengembalikan baris");
  }
  return task;
}

export async function updateTask(id: string, patch: TaskPatch): Promise<Task | undefined> {
  if (!isTaskId(id)) {
    return undefined;
  }
  const values: Partial<Pick<Task, "title" | "done">> = {};
  if (patch.title !== undefined) {
    values.title = patch.title;
  }
  if (patch.done !== undefined) {
    values.done = patch.done;
  }
  if (Object.keys(values).length === 0) {
    return getTask(id);
  }
  const [task] = await getDb().update(tasks).set(values).where(eq(tasks.id, id)).returning();
  return task;
}

/** Balik status `done` secara atomik di database (aman dari race condition). */
export async function toggleTask(id: string): Promise<Task | undefined> {
  if (!isTaskId(id)) {
    return undefined;
  }
  const [task] = await getDb()
    .update(tasks)
    .set({ done: not(tasks.done) })
    .where(eq(tasks.id, id))
    .returning();
  return task;
}

export async function deleteTask(id: string): Promise<boolean> {
  if (!isTaskId(id)) {
    return false;
  }
  const deleted = await getDb().delete(tasks).where(eq(tasks.id, id)).returning({ id: tasks.id });
  return deleted.length > 0;
}
