import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("merender label dengan type=button secara default", () => {
    render(<Button>Simpan</Button>);
    expect(screen.getByRole("button", { name: "Simpan" })).toHaveAttribute("type", "button");
  });

  it("memanggil onClick saat diklik", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Klik</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Klik" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("tidak memanggil onClick saat disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Klik
      </Button>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Klik" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
