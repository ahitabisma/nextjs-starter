import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ApiError } from "./errors";
import { parseJsonBody, parseQuery, toProblemErrors } from "./validate";

const schema = z.object({
  title: z.string().min(1, "wajib"),
  tags: z.array(z.string()).optional(),
});

function jsonRequest(body: string, contentType = "application/json"): Request {
  return new Request("http://localhost/api/x", {
    method: "POST",
    headers: { "content-type": contentType },
    body,
  });
}

async function catchApiError(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof ApiError) {
      return error;
    }
  }
  throw new Error("Diharapkan melempar ApiError");
}

describe("parseJsonBody", () => {
  it("mengembalikan data yang sudah tervalidasi", async () => {
    await expect(parseJsonBody(jsonRequest('{"title":"a"}'), schema)).resolves.toEqual({
      title: "a",
    });
  });

  it("415 jika Content-Type bukan JSON", async () => {
    const error = await catchApiError(parseJsonBody(jsonRequest("x", "text/plain"), schema));
    expect(error.status).toBe(415);
  });

  it("400 jika JSON rusak", async () => {
    const error = await catchApiError(parseJsonBody(jsonRequest("{rusak"), schema));
    expect(error.status).toBe(400);
  });

  it("422 dengan JSON Pointer per field jika validasi gagal", async () => {
    const error = await catchApiError(parseJsonBody(jsonRequest('{"title":""}'), schema));
    expect(error.status).toBe(422);
    expect(error.errors).toEqual([{ detail: "wajib", pointer: "#/title" }]);
  });
});

describe("parseQuery", () => {
  const querySchema = z.object({ limit: z.coerce.number().int().min(1).default(10) });

  it("memakai default dan melakukan coerce", () => {
    expect(parseQuery(new Request("http://localhost/x"), querySchema)).toEqual({ limit: 10 });
    expect(parseQuery(new Request("http://localhost/x?limit=5"), querySchema)).toEqual({
      limit: 5,
    });
  });

  it("400 dengan nama parameter jika tidak valid", () => {
    try {
      parseQuery(new Request("http://localhost/x?limit=0"), querySchema);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(400);
      expect((error as ApiError).errors?.[0]).toMatchObject({ parameter: "limit" });
    }
  });
});

describe("toProblemErrors", () => {
  it("meng-escape karakter spesial pada JSON Pointer", () => {
    const result = z.object({ "a/b": z.string() }).safeParse({ "a/b": 1 });
    if (result.success) {
      expect.unreachable();
    }
    expect(toProblemErrors(result.error, "body")[0]?.pointer).toBe("#/a~1b");
  });

  it("memakai '#' untuk error di level root", () => {
    const result = z
      .object({})
      .refine(() => false, "gagal")
      .safeParse({});
    if (result.success) {
      expect.unreachable();
    }
    expect(toProblemErrors(result.error, "body")[0]?.pointer).toBe("#");
  });
});
