import { createTask, listTasks } from "@/features/tasks/repository";
import { listTasksQuerySchema, taskInputSchema } from "@/features/tasks/schema";
import { toTaskResponse } from "@/features/tasks/serializer";
import { created, list } from "@/lib/api/response";
import { route } from "@/lib/api/route";
import { parseJsonBody, parseQuery } from "@/lib/api/validate";

/**
 * GET /api/tasks?limit=20&offset=0&done=true
 * 200 `{ data: Task[], meta: { total, limit, offset } }`
 */
export const GET = route(async (request) => {
  const query = parseQuery(request, listTasksQuerySchema);
  const { items, total } = await listTasks(query);
  return list(items.map(toTaskResponse), { total, limit: query.limit, offset: query.offset });
});

/**
 * POST /api/tasks — body `{ "title": string }`
 * 201 `{ data: Task }` + header `Location: /api/tasks/:id`
 */
export const POST = route(async (request) => {
  const input = await parseJsonBody(request, taskInputSchema);
  const task = await createTask(input);
  return created(toTaskResponse(task), `/api/tasks/${task.id}`);
});
