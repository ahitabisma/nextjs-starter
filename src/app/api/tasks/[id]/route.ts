import { deleteTask, getTask, updateTask } from "@/features/tasks/repository";
import { taskPatchSchema } from "@/features/tasks/schema";
import { toTaskResponse } from "@/features/tasks/serializer";
import { notFound } from "@/lib/api/errors";
import { noContent, ok } from "@/lib/api/response";
import { route } from "@/lib/api/route";
import { parseJsonBody } from "@/lib/api/validate";

type Context = RouteContext<"/api/tasks/[id]">;

const taskNotFound = (id: string) => notFound(`Task dengan id '${id}' tidak ditemukan`);

/** GET /api/tasks/:id — 200 `{ data: Task }` atau 404 problem. */
export const GET = route<Context>(async (_request, { params }) => {
  const { id } = await params;
  const task = await getTask(id);
  if (!task) {
    throw taskNotFound(id);
  }
  return ok(toTaskResponse(task));
});

/** PATCH /api/tasks/:id — body `{ "title"?: string, "done"?: boolean }`. */
export const PATCH = route<Context>(async (request, { params }) => {
  const { id } = await params;
  const patch = await parseJsonBody(request, taskPatchSchema);
  const task = await updateTask(id, patch);
  if (!task) {
    throw taskNotFound(id);
  }
  return ok(toTaskResponse(task));
});

/** DELETE /api/tasks/:id — 204 tanpa body. */
export const DELETE = route<Context>(async (_request, { params }) => {
  const { id } = await params;
  if (!(await deleteTask(id))) {
    throw taskNotFound(id);
  }
  return noContent();
});
