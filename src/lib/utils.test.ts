import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("menggabungkan class dan mengabaikan nilai falsy", () => {
    expect(cn("px-2", false, undefined, "text-sm")).toBe("px-2 text-sm");
  });

  it("menyelesaikan class Tailwind yang bentrok (yang terakhir menang)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
