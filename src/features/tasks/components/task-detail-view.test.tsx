import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Task } from "@/features/tasks/schema";
import { TaskDetailView } from "./task-detail-view";

vi.mock("@/features/tasks/actions", () => ({
  toggleTaskAction: vi.fn(),
  deleteTaskAction: vi.fn(),
}));

const task: Task = {
  id: "abc",
  title: "Deploy ke production",
  done: false,
  createdAt: new Date("2026-10-30T06:55:00.000Z"),
  updatedAt: new Date("2026-10-30T06:55:00.000Z"),
};

describe("TaskDetailView", () => {
  it("menampilkan judul dan status", () => {
    render(<TaskDetailView task={task} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Deploy ke production" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Belum selesai")).toBeInTheDocument();
  });

  it("menawarkan aksi sesuai status task", () => {
    render(<TaskDetailView task={{ ...task, done: true }} />);
    expect(screen.getByText("Selesai")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tandai belum selesai" })).toBeInTheDocument();
  });

  it("punya tautan kembali ke daftar", () => {
    render(<TaskDetailView task={task} />);
    expect(screen.getByRole("link", { name: /Kembali/ })).toHaveAttribute("href", "/tasks");
  });
});
