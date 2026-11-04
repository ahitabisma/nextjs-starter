import { describe, expect, it } from "vitest";
import { toTaskResponse } from "./serializer";

describe("toTaskResponse", () => {
  it("mengubah Date menjadi ISO string dan hanya mengekspos field publik", () => {
    const row = {
      id: "7d6a8e0c-3f0b-4a73-9d3d-1a2b3c4d5e6f",
      title: "Tes",
      done: false,
      createdAt: new Date("2026-10-30T06:55:00.000Z"),
      updatedAt: new Date("2026-10-30T07:00:00.000Z"),
    };
    expect(toTaskResponse(row)).toEqual({
      ...row,
      createdAt: "2026-10-30T06:55:00.000Z",
      updatedAt: "2026-10-30T07:00:00.000Z",
    });
  });
});
