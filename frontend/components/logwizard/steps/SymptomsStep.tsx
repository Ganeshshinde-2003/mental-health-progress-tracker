"use client";

import { Chip } from "../../Chip";
import { SYMPTOM_OPTIONS, SEVERITY_LABELS } from "@/lib/logwizard-utils";

type Props = {
  symptoms: Record<string, number>;
  onToggleSymptom: (name: string) => void;
  onSetSeverity: (name: string, severity: number) => void;
};

export function SymptomsStep({ symptoms, onToggleSymptom, onSetSeverity }: Props) {
  return (
    <div>
      <p className="text-muted" style={{ fontSize: 13 }}>
        Select anything you noticed today. This stays private and helps show patterns over
        time.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {SYMPTOM_OPTIONS.map((symptom) => {
          const checked = symptom in symptoms;
          return (
            <div key={symptom} className="card" style={{ padding: "var(--space-3)" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleSymptom(symptom)}
                />
                <span>{symptom}</span>
              </label>
              {checked && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "var(--space-2)",
                    marginTop: "var(--space-3)",
                  }}
                >
                  {SEVERITY_LABELS.map((label, i) => (
                    <Chip
                      key={label}
                      label={label}
                      active={symptoms[symptom] === i}
                      onClick={() => onSetSeverity(symptom, i)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
