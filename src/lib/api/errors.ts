/** Satu item error validasi (RFC 9457 extension member `errors`). */
export type ProblemError = {
  detail: string;
  /** JSON Pointer ke field body yang salah, contoh: `#/title`. */
  pointer?: string;
  /** Nama query parameter yang salah. */
  parameter?: string;
};

type ApiErrorInit = {
  status: number;
  title: string;
  detail: string;
  /** URI jenis masalah. `about:blank` = cukup dijelaskan oleh status HTTP-nya (RFC 9457 §4.2.1). */
  type?: string;
  errors?: ProblemError[];
};

/** Lempar ini dari route handler; `route()` mengubahnya jadi response `application/problem+json`. */
export class ApiError extends Error {
  readonly status: number;
  readonly title: string;
  readonly type: string;
  readonly errors: ProblemError[] | undefined;

  constructor({ status, title, detail, type = "about:blank", errors }: ApiErrorInit) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.title = title;
    this.type = type;
    this.errors = errors;
  }
}

export const VALIDATION_PROBLEM_TYPE = "/problems/validation-error";

export function badRequest(detail: string, errors?: ProblemError[]): ApiError {
  return new ApiError({ status: 400, title: "Bad Request", detail, errors });
}

export function notFound(detail: string): ApiError {
  return new ApiError({ status: 404, title: "Not Found", detail });
}

export function unsupportedMediaType(detail: string): ApiError {
  return new ApiError({ status: 415, title: "Unsupported Media Type", detail });
}

export function validationFailed(errors: ProblemError[]): ApiError {
  return new ApiError({
    status: 422,
    title: "Validation failed",
    detail: "Satu atau lebih field tidak valid.",
    type: VALIDATION_PROBLEM_TYPE,
    errors,
  });
}
