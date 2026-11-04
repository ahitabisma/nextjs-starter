import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TasksPage from "./page";

// Async Server Component dan Server Action tidak bisa jalan di jsdom: di-mock, yang dites hanya susunan halaman.
vi.mock("@/features/tasks/components/tasks-section", () => ({
  TasksSection: () => <p>daftar task</p>,
}));
vi.mock("@/features/tasks/components/task-form", () => ({
  TaskForm: () => <p>form task</p>,
}));

describe("Tasks page", () => {
  it("menyusun judul, form, dan daftar task", () => {
    render(<TasksPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Tasks" })).toBeInTheDocument();
    expect(screen.getByText("form task")).toBeInTheDocument();
    expect(screen.getByText("daftar task")).toBeInTheDocument();
  });
});
