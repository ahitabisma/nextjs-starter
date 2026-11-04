import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TaskNotFound from "./not-found";

describe("Task not-found page", () => {
  it("menampilkan pesan dan tautan kembali", () => {
    render(<TaskNotFound />);
    expect(screen.getByRole("heading", { name: "Task tidak ditemukan" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kembali ke daftar task" })).toHaveAttribute(
      "href",
      "/tasks",
    );
  });
});
