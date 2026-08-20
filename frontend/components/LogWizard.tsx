"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import {
  STEP_TITLES,
  initialFormState,
  canAdvance,
  buildLogPayload,
  toggleSymptom,
  type ExistingLog,
  type LogFormState,
} from "@/lib/logwizard-utils";
import { MoodStep } from "./logwizard/steps/MoodStep";
import { AnxietyStep } from "./logwizard/steps/AnxietyStep";
import { SleepStep } from "./logwizard/steps/SleepStep";
import { ActivityStep } from "./logwizard/steps/ActivityStep";
import { SocialStressStep } from "./logwizard/steps/SocialStressStep";
import { SymptomsStep } from "./logwizard/steps/SymptomsStep";
import { ReviewStep } from "./logwizard/steps/ReviewStep";

export type { ExistingLog };

type Props = {
  onClose: () => void;
  onSaved: () => void;
  existingLog?: ExistingLog;
};

export function LogWizard({ onClose, onSaved, existingLog }: Props) {
  const { getIdToken } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<LogFormState>(() => initialFormState(existingLog));

  const patch = (update: Partial<LogFormState>) =>
    setState((prev) => ({ ...prev, ...update }));

  const next = () => setStep((s) => Math.min(s + 1, STEP_TITLES.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    const token = await getIdToken();
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/api/log", token, {
        method: "POST",
        body: JSON.stringify(buildLogPayload(state, new Date().toISOString().slice(0, 10))),
      });
      onSaved();
    } catch {
      setError("Couldn't save your entry. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dialog-backdrop modal-in">
      <div
        className="dialog elev-lg modal-in"
        style={{ width: "min(480px, 100%)", maxHeight: "90vh", minHeight: 0 }}
      >
        <div style={{ display: "flex", gap: 4 }}>
          {STEP_TITLES.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 999,
                background: i <= step ? "var(--color-accent)" : "var(--color-divider)",
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="dialog-title" style={{ margin: 0 }}>
            {STEP_TITLES[step]}
          </h2>
          <button
            className="btn"
            style={{ padding: 0, fontSize: 20 }}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div
          key={step}
          className="step-transition"
          style={{ overflowY: "auto", flex: 1, minHeight: 0 }}
        >
          {step === 0 && <MoodStep value={state.mood} onChange={(v) => patch({ mood: v })} />}

          {step === 1 && (
            <AnxietyStep value={state.anxiety} onChange={(v) => patch({ anxiety: v })} />
          )}

          {step === 2 && (
            <SleepStep
              sleepHours={state.sleepHours}
              onSleepHoursChange={(v) => patch({ sleepHours: v })}
              sleepQuality={state.sleepQuality}
              onSleepQualityChange={(v) => patch({ sleepQuality: v })}
              disturbances={state.disturbances}
              onDisturbancesChange={(v) => patch({ disturbances: v })}
            />
          )}

          {step === 3 && (
            <ActivityStep
              activityType={state.activityType}
              onActivityTypeChange={(v) => patch({ activityType: v })}
              activityDuration={state.activityDuration}
              onActivityDurationChange={(v) => patch({ activityDuration: v })}
            />
          )}

          {step === 4 && (
            <SocialStressStep
              socialFrequency={state.socialFrequency}
              onSocialFrequencyChange={(v) => patch({ socialFrequency: v })}
              stressLevel={state.stressLevel}
              onStressLevelChange={(v) => patch({ stressLevel: v })}
            />
          )}

          {step === 5 && (
            <SymptomsStep
              symptoms={state.symptoms}
              onToggleSymptom={(name) =>
                patch({ symptoms: toggleSymptom(state.symptoms, name) })
              }
              onSetSeverity={(name, severity) =>
                patch({ symptoms: { ...state.symptoms, [name]: severity } })
              }
            />
          )}

          {step === 6 && <ReviewStep state={state} onEditStep={setStep} />}
        </div>

        {error && <p style={{ color: "var(--color-accent-700)", fontSize: 13 }}>{error}</p>}

        <div className="dialog-actions" style={{ justifyContent: "space-between" }}>
          <button className="btn btn-secondary" onClick={step === 0 ? onClose : back}>
            {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < STEP_TITLES.length - 1 ? (
            <button
              className="btn btn-primary"
              disabled={!canAdvance(step, state)}
              onClick={next}
            >
              Next
            </button>
          ) : (
            <button className="btn btn-primary" disabled={saving} onClick={handleSubmit}>
              {saving ? "Saving…" : existingLog ? "Update entry" : "Save today's entry"}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .dialog-backdrop.modal-in {
          animation: backdrop-in 200ms ease;
        }
        .dialog.modal-in {
          animation: dialog-in 220ms ease;
        }
        @keyframes backdrop-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes dialog-in {
          from {
            opacity: 0;
            transform: scale(0.97) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .step-transition {
          animation: step-in 220ms ease;
        }
        @keyframes step-in {
          from {
            opacity: 0;
            transform: translateX(12px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
