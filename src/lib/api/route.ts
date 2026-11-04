import { unstable_rethrow } from "next/navigation";
import { ApiError } from "./errors";
import { internalErrorResponse, problemResponse } from "./problem";

type Handler<Context> = (request: Request, context: Context) => Response | Promise<Response>;

const REQUEST_ID_PATTERN = /^[\w-]{1,64}$/;

function resolveRequestId(request: Request): string {
  const incoming = request.headers.get("x-request-id");
  return incoming && REQUEST_ID_PATTERN.test(incoming) ? incoming : crypto.randomUUID();
}

/**
 * Bungkus SEMUA route handler dengan ini. Efeknya:
 * - `throw ApiError` → response `application/problem+json` yang seragam;
 * - error tak terduga → 500 generik (detail hanya di log server);
 * - header `X-Request-Id` selalu ada di response.
 */
export function route<Context = unknown>(handler: Handler<Context>) {
  return async (request: Request, context: Context): Promise<Response> => {
    const requestId = resolveRequestId(request);
    const problemContext = { requestId, instance: new URL(request.url).pathname };

    let response: Response;
    try {
      response = await handler(request, context);
    } catch (error) {
      unstable_rethrow(error); // jangan telan error internal Next.js (notFound, redirect, prerender)
      if (error instanceof ApiError) {
        response = problemResponse(error, problemContext);
      } else {
        console.error(`[${requestId}] Unhandled error`, error);
        response = internalErrorResponse(problemContext);
      }
    }

    response.headers.set("X-Request-Id", requestId);
    return response;
  };
}
