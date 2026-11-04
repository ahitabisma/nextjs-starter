const NO_STORE = { "Cache-Control": "no-store" } as const;

export type PaginationMeta = {
  total: number;
  limit: number;
  offset: number;
};

/** 200 — satu resource: `{ data }`. */
export function ok<T>(data: T): Response {
  return Response.json({ data }, { headers: NO_STORE });
}

/** 200 — koleksi: `{ data: [...], meta: { total, limit, offset } }`. */
export function list<T>(data: T[], meta: PaginationMeta): Response {
  return Response.json({ data, meta }, { headers: NO_STORE });
}

/** 201 — resource baru, dengan header `Location` ke resource tersebut. */
export function created<T>(data: T, location: string): Response {
  return Response.json({ data }, { status: 201, headers: { ...NO_STORE, Location: location } });
}

/** 204 — sukses tanpa body (mis. DELETE). */
export function noContent(): Response {
  return new Response(null, { status: 204, headers: NO_STORE });
}
