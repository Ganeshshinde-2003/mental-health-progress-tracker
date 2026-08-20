"use client";

import { ScaleField } from "../ScaleField";
import { SOCIAL_EMOJI, STRESS_EMOJI } from "@/lib/logwizard-utils";

type Props = {
  socialFrequency: number;
  onSocialFrequencyChange: (v: number) => void;
  stressLevel: number;
  onStressLevelChange: (v: number) => void;
};

export function SocialStressStep({
  socialFrequency,
  onSocialFrequencyChange,
  stressLevel,
  onStressLevelChange,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <ScaleField
        label="Social interaction"
        tooltip="1 = isolated, 5 = very social. How connected did you feel today?"
        value={socialFrequency}
        onChange={onSocialFrequencyChange}
        emoji={SOCIAL_EMOJI}
        compact
      />
      <ScaleField
        label="Stress level"
        tooltip="1 = relaxed, 5 = highly stressed."
        value={stressLevel}
        onChange={onStressLevelChange}
        emoji={STRESS_EMOJI}
        compact
      />
    </div>
  );
}
