import { describe, expect, it } from "vitest";
import { formatDateTime, formatRupiah } from "./format";

describe("formatRupiah", () => {
  it("memakai pemisah ribuan titik", () => {
    expect(formatRupiah(1_500_000)).toBe("Rp 1.500.000");
  });

  it("menangani nol", () => {
    expect(formatRupiah(0)).toBe("Rp 0");
  });
});

describe("formatDateTime", () => {
  it("memakai zona waktu WIB (UTC+7)", () => {
    expect(formatDateTime("2026-10-30T06:55:00.000Z")).toMatch(/30 Okt 2026.*13[.:]55/);
  });
});
