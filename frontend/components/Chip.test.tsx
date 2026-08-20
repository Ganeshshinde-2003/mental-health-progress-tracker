import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Chip } from "./Chip";

describe("Chip", () => {
  test("renders its label", () => {
    render(<Chip label="Week" active={false} onClick={() => {}} />);
    expect(screen.getByRole("button", { name: "Week" })).toBeInTheDocument();
  });

  test("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Chip label="Month" active={false} onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: "Month" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("active state renders with the accent border color", () => {
    render(<Chip label="Week" active onClick={() => {}} />);
    const button = screen.getByRole("button", { name: "Week" });
    expect(button.style.border).toContain("var(--color-accent)");
  });
});
