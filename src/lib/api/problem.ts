import { ApiError } from "./errors";

export const PROBLEM_CONTENT_TYPE = "application/problem+json";

export type ProblemContext = {
  /** ID request untuk korelasi dengan log. Juga dikirim sebagai header `X-Request-Id`. */
  requestId: string;
  /** Path request yang menghasilkan masalah ini. */
  instance: string;
};

/** Bentuk response error standar RFC 9457 (Problem Details for HTTP APIs). */
export function problemResponse(
  error: ApiError,
  { requestId, instance }: ProblemContext,
): Response {
  const body = {
    type: error.type,
    title: error.title,
    status: error.status,
    detail: error.message,
    instance,
    requestId,
    ...(error.errors ? { errors: error.errors } : {}),
  };
  return new Response(JSON.stringify(body), {
    status: error.status,
    headers: { "Content-Type": PROBLEM_CONTENT_TYPE, "Cache-Control": "no-store" },
  });
}

/** Error tak terduga: jangan bocorkan detail internal ke klien. */
export function internalErrorResponse(context: ProblemContext): Response {
  return problemResponse(
    new ApiError({
      status: 500,
      title: "Internal Server Error",
      detail: "Terjadi kesalahan pada server. Sertakan requestId saat melapor.",
    }),
    context,
  );
}
