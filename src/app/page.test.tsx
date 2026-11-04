import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home page", () => {
  it("menampilkan judul dan tombol utama", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mulai" })).toBeInTheDocument();
  });

  it("menautkan ke contoh fitur Tasks", () => {
    render(<Home />);
    expect(screen.getByRole("link", { name: "Contoh fitur: Tasks" })).toHaveAttribute(
      "href",
      "/tasks",
    );
  });
});
