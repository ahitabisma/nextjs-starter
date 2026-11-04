import type { z } from "zod";
import { badRequest, type ProblemError, unsupportedMediaType, validationFailed } from "./errors";

function toJsonPointer(path: PropertyKey[]): string {
  if (path.length === 0) {
    return "#";
  }
  const segments = path.map((segment) =>
    String(segment).replaceAll("~", "~0").replaceAll("/", "~1"),
  );
  return `#/${segments.join("/")}`;
}

/** Ubah ZodError jadi daftar error RFC 9457 (`pointer` untuk body, `parameter` untuk query). */
export function toProblemErrors(error: z.ZodError, source: "body" | "query"): ProblemError[] {
  return error.issues.map((issue) =>
    source === "body"
      ? { detail: issue.message, pointer: toJsonPointer(issue.path) }
      : { detail: issue.message, parameter: issue.path.map(String).join(".") },
  );
}

/** Baca & validasi body JSON. 415 jika bukan JSON, 400 jika rusak, 422 jika tidak lolos schema. */
export async function parseJsonBody<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<z.output<T>> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    throw unsupportedMediaType("Content-Type harus application/json");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw badRequest("Body request bukan JSON yang valid");
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw validationFailed(toProblemErrors(parsed.error, "body"));
  }
  return parsed.data;
}

/** Validasi query string. Gunakan `z.coerce.*` untuk angka/boolean. 400 jika tidak valid. */
export function parseQuery<T extends z.ZodType>(request: Request, schema: T): z.output<T> {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    throw badRequest("Query parameter tidak valid", toProblemErrors(parsed.error, "query"));
  }
  return parsed.data;
}
