import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScaleField } from "./ScaleField";

const EMOJI = ["😢", "😕", "😐", "🙂", "😄"];

describe("ScaleField", () => {
  test("renders one button per emoji option", () => {
    render(<ScaleField value={0} onChange={() => {}} emoji={EMOJI} />);
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  test("calls onChange with the 1-indexed value of the clicked option", async () => {
    const onChange = vi.fn();
    render(<ScaleField value={0} onChange={onChange} emoji={EMOJI} />);
    await userEvent.click(screen.getByText("🙂"));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  test("renders label and tooltip trigger when provided", () => {
    render(
      <ScaleField
        value={0}
        onChange={() => {}}
        emoji={EMOJI}
        label="Mood"
        tooltip="How you felt overall."
      />
    );
    expect(screen.getByText("Mood")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "How you felt overall." })).toBeInTheDocument();
  });
});
