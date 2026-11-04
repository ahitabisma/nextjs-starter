import type { Task } from "./schema";

/** Bentuk task di response API — kontrak publik, sengaja terpisah dari baris database. */
export type TaskResponse = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
};

export function toTaskResponse(task: Task): TaskResponse {
  return {
    id: task.id,
    title: task.title,
    done: task.done,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}
