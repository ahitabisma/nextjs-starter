import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import TasksError from "./error";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Tasks error boundary", () => {
  it("melaporkan error dan memanggil retry saat tombol diklik", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("gagal");
    const retry = vi.fn();
    render(<TasksError error={error} retry={retry} />);

    expect(consoleError).toHaveBeenCalledWith(error);
    await userEvent.click(screen.getByRole("button", { name: "Coba lagi" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
