"use client";

import { ScaleField } from "../ScaleField";
import { ANXIETY_EMOJI } from "@/lib/logwizard-utils";

export function AnxietyStep({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <ScaleField
      value={value}
      onChange={onChange}
      emoji={ANXIETY_EMOJI}
      label="Anxiety"
      tooltip="1 = calm, 5 = very anxious."
    />
  );
}
