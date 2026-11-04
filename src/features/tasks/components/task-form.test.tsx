import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createTaskAction } from "@/features/tasks/actions";
import { TaskForm } from "./task-form";

vi.mock("@/features/tasks/actions", () => ({ createTaskAction: vi.fn() }));

describe("TaskForm", () => {
  it("mengirim isi input ke server action", async () => {
    vi.mocked(createTaskAction).mockResolvedValue({});
    render(<TaskForm />);

    await userEvent.type(screen.getByLabelText("Judul task"), "Belajar Vitest");
    await userEvent.click(screen.getByRole("button", { name: "Tambah" }));

    expect(createTaskAction).toHaveBeenCalledTimes(1);
    const formData = vi.mocked(createTaskAction).mock.calls[0]?.[1];
    expect(formData?.get("title")).toBe("Belajar Vitest");
  });

  it("menampilkan pesan error dari server action", async () => {
    vi.mocked(createTaskAction).mockResolvedValue({ error: "Judul wajib diisi" });
    render(<TaskForm />);

    await userEvent.type(screen.getByLabelText("Judul task"), " ");
    await userEvent.click(screen.getByRole("button", { name: "Tambah" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Judul wajib diisi");
  });
});
