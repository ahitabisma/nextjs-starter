import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TaskDetailPage from "./page";

vi.mock("@/features/tasks/components/task-detail", () => ({
  TaskDetail: () => <p>detail task</p>,
}));

describe("Task detail page", () => {
  it("merender detail task di dalam Suspense", () => {
    render(
      <TaskDetailPage params={Promise.resolve({ id: "abc" })} searchParams={Promise.resolve({})} />,
    );
    expect(screen.getByText("detail task")).toBeInTheDocument();
  });
});
