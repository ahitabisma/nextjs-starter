import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Task } from "@/features/tasks/schema";
import { TaskList } from "./task-list";

vi.mock("@/features/tasks/actions", () => ({
  toggleTaskAction: vi.fn(),
  deleteTaskAction: vi.fn(),
}));

const tasks: Task[] = [
  {
    id: "a",
    title: "Belum selesai",
    done: false,
    createdAt: new Date("2026-10-30T00:00:00.000Z"),
    updatedAt: new Date("2026-10-30T00:00:00.000Z"),
  },
  {
    id: "b",
    title: "Sudah selesai",
    done: true,
    createdAt: new Date("2026-10-30T00:00:00.000Z"),
    updatedAt: new Date("2026-10-30T00:00:00.000Z"),
  },
];

describe("TaskList", () => {
  it("menampilkan pesan kosong saat tidak ada task", () => {
    render(<TaskList tasks={[]} />);
    expect(screen.getByText("Belum ada task.")).toBeInTheDocument();
  });

  it("menautkan setiap task ke halaman detailnya", () => {
    render(<TaskList tasks={tasks} />);
    expect(screen.getByRole("link", { name: "Belum selesai" })).toHaveAttribute("href", "/tasks/a");
    expect(screen.getByRole("link", { name: "Sudah selesai" })).toHaveAttribute("href", "/tasks/b");
  });

  it("menandai task yang selesai dengan coretan", () => {
    render(<TaskList tasks={tasks} />);
    expect(screen.getByRole("link", { name: "Sudah selesai" })).toHaveClass("line-through");
    expect(screen.getByRole("link", { name: "Belum selesai" })).not.toHaveClass("line-through");
  });

  it("menyediakan tombol toggle dan hapus per task", () => {
    render(<TaskList tasks={tasks} />);
    expect(
      screen.getByRole("button", { name: "Tandai selesai: Belum selesai" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hapus: Sudah selesai" })).toBeInTheDocument();
  });
});
