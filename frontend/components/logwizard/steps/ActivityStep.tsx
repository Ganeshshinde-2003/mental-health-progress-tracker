"use client";

import { Chip } from "../../Chip";
import { Tooltip } from "../../Tooltip";
import { ACTIVITY_OPTIONS } from "@/lib/logwizard-utils";

type Props = {
  activityType: string;
  onActivityTypeChange: (v: string) => void;
  activityDuration: number;
  onActivityDurationChange: (v: number) => void;
};

export function ActivityStep({
  activityType,
  onActivityTypeChange,
  activityDuration,
  onActivityDurationChange,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
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
          Activity type
          <Tooltip text="Whatever movement you did today, even a short walk counts." />
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
          {ACTIVITY_OPTIONS.map((opt) => (
            <Chip
              key={opt}
              label={opt}
              active={activityType === opt}
              onClick={() => onActivityTypeChange(opt === activityType ? "" : opt)}
            />
          ))}
        </div>
      </div>
      <label>
        <span style={{ display: "block", fontWeight: 600, marginBottom: "var(--space-2)" }}>
          Duration (minutes)
        </span>
        <input
          className="input"
          type="number"
          min={0}
          max={1440}
          value={activityDuration}
          onChange={(e) => onActivityDurationChange(parseInt(e.target.value) || 0)}
        />
      </label>
    </div>
  );
}
