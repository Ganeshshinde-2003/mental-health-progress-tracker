"use client";

import { ScaleField } from "../ScaleField";
import { Chip } from "../../Chip";
import { Tooltip } from "../../Tooltip";
import { DISTURBANCE_OPTIONS, SLEEP_QUALITY_EMOJI, toggleInList } from "@/lib/logwizard-utils";

type Props = {
  sleepHours: number;
  onSleepHoursChange: (v: number) => void;
  sleepQuality: number;
  onSleepQualityChange: (v: number) => void;
  disturbances: string[];
  onDisturbancesChange: (v: string[]) => void;
};

export function SleepStep({
  sleepHours,
  onSleepHoursChange,
  sleepQuality,
  onSleepQualityChange,
  disturbances,
  onDisturbancesChange,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <label>
        <span style={{ display: "block", fontWeight: 600, marginBottom: "var(--space-2)" }}>
          Hours slept
        </span>
        <input
          type="range"
          min={0}
          max={12}
          step={0.5}
          value={sleepHours}
          onChange={(e) => onSleepHoursChange(parseFloat(e.target.value))}
          style={{ width: "100%" }}
        />
        <span style={{ fontWeight: 600 }}>{sleepHours}h</span>
      </label>

      <ScaleField
        label="Sleep quality"
        tooltip="How rested did you feel? 1 = poor, 5 = excellent."
        value={sleepQuality}
        onChange={onSleepQualityChange}
        emoji={SLEEP_QUALITY_EMOJI}
        compact
      />

      <div>
        <span
          className="text-muted"
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 12,
            marginBottom: "var(--space-2)",
          }}
        >
          Any disturbances? (select any)
          <Tooltip text="Anything that interrupted or affected your sleep last night." />
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
          {DISTURBANCE_OPTIONS.map((opt) => (
            <Chip
              key={opt}
              label={opt}
              active={disturbances.includes(opt)}
              onClick={() => onDisturbancesChange(toggleInList(disturbances, opt))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
