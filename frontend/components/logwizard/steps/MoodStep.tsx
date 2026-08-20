"use client";

import { ScaleField } from "../ScaleField";
import { MOOD_EMOJI } from "@/lib/logwizard-utils";

export function MoodStep({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <ScaleField
      value={value}
      onChange={onChange}
      emoji={MOOD_EMOJI}
      label="Mood"
      tooltip="Rate how you generally felt today, overall."
    />
  );
}
