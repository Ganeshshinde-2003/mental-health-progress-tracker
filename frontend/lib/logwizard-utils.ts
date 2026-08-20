export const MOOD_EMOJI = ["😢", "😕", "😐", "🙂", "😄"];
export const ANXIETY_EMOJI = ["😌", "🙂", "😐", "😟", "😰"];
export const SLEEP_QUALITY_EMOJI = ["😩", "😕", "😐", "🙂", "😴"];
export const SOCIAL_EMOJI = ["🚪", "🙂", "👥", "🎉", "🎊"];
export const STRESS_EMOJI = ["😌", "🙂", "😐", "😣", "🥵"];

export const DISTURBANCE_OPTIONS = [
  "None",
  "Woke up often",
  "Nightmares",
  "Trouble falling asleep",
];
export const ACTIVITY_OPTIONS = ["Walk", "Run", "Yoga", "Gym", "None", "Other"];
export const SYMPTOM_OPTIONS = [
  "Low energy",
  "Trouble concentrating",
  "Irritability",
  "Hopelessness",
  "Restlessness",
];
export const SEVERITY_LABELS = ["None", "Mild", "Moderate", "Severe"];

export const STEP_TITLES = [
  "How's your mood?",
  "How anxious did you feel?",
  "How did you sleep?",
  "Physical activity",
  "Social & stress",
  "Symptoms",
  "Review",
];

export type ExistingLog = {
  mood: number;
  anxiety: number;
  sleep_hours: number;
  sleep_quality: number;
  sleep_disturbances: string | null;
  activity_type: string | null;
  activity_duration: number | null;
  social_frequency: number;
  stress_level: number;
  symptoms: { name: string; severity: number }[];
};

export type LogFormState = {
  mood: number;
  anxiety: number;
  sleepHours: number;
  sleepQuality: number;
  disturbances: string[];
  activityType: string;
  activityDuration: number;
  socialFrequency: number;
  stressLevel: number;
  symptoms: Record<string, number>;
};

export function initialFormState(existingLog?: ExistingLog): LogFormState {
  return {
    mood: existingLog?.mood ?? 0,
    anxiety: existingLog?.anxiety ?? 0,
    sleepHours: existingLog?.sleep_hours ?? 7,
    sleepQuality: existingLog?.sleep_quality ?? 0,
    disturbances: existingLog?.sleep_disturbances
      ? existingLog.sleep_disturbances.split(", ").filter(Boolean)
      : [],
    activityType: existingLog?.activity_type ?? "",
    activityDuration: existingLog?.activity_duration ?? 0,
    socialFrequency: existingLog?.social_frequency ?? 0,
    stressLevel: existingLog?.stress_level ?? 0,
    symptoms: existingLog?.symptoms
      ? Object.fromEntries(existingLog.symptoms.map((s) => [s.name, s.severity]))
      : {},
  };
}

export function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** Adding a symptom defaults it to severity 1 ("Mild"); removing drops the key entirely. */
export function toggleSymptom(
  symptoms: Record<string, number>,
  name: string
): Record<string, number> {
  const next = { ...symptoms };
  if (name in next) delete next[name];
  else next[name] = 1;
  return next;
}

/** Whether the wizard can move past the given step with the current form state. */
export function canAdvance(step: number, state: LogFormState): boolean {
  switch (step) {
    case 0:
      return state.mood > 0;
    case 1:
      return state.anxiety > 0;
    case 2:
      return state.sleepQuality > 0;
    case 4:
      return state.socialFrequency > 0 && state.stressLevel > 0;
    default:
      return true;
  }
}

/** Builds the exact body shape the backend's POST /log endpoint expects. */
export function buildLogPayload(state: LogFormState, date: string) {
  return {
    date,
    mood: state.mood,
    anxiety: state.anxiety,
    sleepHours: state.sleepHours,
    sleepQuality: state.sleepQuality,
    sleepDisturbances: state.disturbances.join(", ") || undefined,
    activityType: state.activityType || undefined,
    activityDuration: state.activityDuration || undefined,
    socialFrequency: state.socialFrequency,
    stressLevel: state.stressLevel,
    symptoms: Object.entries(state.symptoms).map(([name, severity]) => ({
      name,
      severity,
    })),
  };
}
