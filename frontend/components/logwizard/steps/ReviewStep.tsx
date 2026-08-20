"use client";

import { ReviewRow } from "../ReviewRow";
import {
  MOOD_EMOJI,
  ANXIETY_EMOJI,
  SEVERITY_LABELS,
  type LogFormState,
} from "@/lib/logwizard-utils";

type Props = {
  state: LogFormState;
  onEditStep: (step: number) => void;
};

export function ReviewStep({ state, onEditStep }: Props) {
  const symptomEntries = Object.entries(state.symptoms);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <ReviewRow label="Mood" value={MOOD_EMOJI[state.mood - 1]} onEdit={() => onEditStep(0)} />
      <ReviewRow
        label="Anxiety"
        value={ANXIETY_EMOJI[state.anxiety - 1]}
        onEdit={() => onEditStep(1)}
      />
      <ReviewRow
        label="Sleep"
        value={`${state.sleepHours}h, quality ${state.sleepQuality}/5${
          state.disturbances.length ? `, ${state.disturbances.join(", ")}` : ""
        }`}
        onEdit={() => onEditStep(2)}
      />
      <ReviewRow
        label="Activity"
        value={
          state.activityType
            ? `${state.activityType}${
                state.activityDuration ? `, ${state.activityDuration} min` : ""
              }`
            : "None logged"
        }
        onEdit={() => onEditStep(3)}
      />
      <ReviewRow
        label="Social & stress"
        value={`Social ${state.socialFrequency}/5, stress ${state.stressLevel}/5`}
        onEdit={() => onEditStep(4)}
      />
      <ReviewRow
        label="Symptoms"
        value={
          symptomEntries.length
            ? symptomEntries
                .map(([name, sev]) => `${name} (${SEVERITY_LABELS[sev]})`)
                .join(", ")
            : "None"
        }
        onEdit={() => onEditStep(5)}
      />
    </div>
  );
}
