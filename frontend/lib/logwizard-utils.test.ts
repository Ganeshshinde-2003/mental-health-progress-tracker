import { describe, test, expect } from "vitest";
import {
  initialFormState,
  canAdvance,
  buildLogPayload,
  toggleInList,
  toggleSymptom,
  type ExistingLog,
} from "./logwizard-utils";

describe("initialFormState", () => {
  test("defaults to zeroed/empty state with no existing log", () => {
    const state = initialFormState();
    expect(state.mood).toBe(0);
    expect(state.sleepHours).toBe(7);
    expect(state.disturbances).toEqual([]);
    expect(state.symptoms).toEqual({});
  });

  test("prefills from an existing log, splitting disturbances and rebuilding symptom map", () => {
    const existing: ExistingLog = {
      mood: 4,
      anxiety: 2,
      sleep_hours: 6.5,
      sleep_quality: 3,
      sleep_disturbances: "None, Woke up often",
      activity_type: "Walk",
      activity_duration: 20,
      social_frequency: 3,
      stress_level: 2,
      symptoms: [{ name: "Low energy", severity: 1 }],
    };

    const state = initialFormState(existing);

    expect(state.mood).toBe(4);
    expect(state.sleepHours).toBe(6.5);
    expect(state.disturbances).toEqual(["None", "Woke up often"]);
    expect(state.activityType).toBe("Walk");
    expect(state.symptoms).toEqual({ "Low energy": 1 });
  });

  test("handles a null sleep_disturbances without crashing", () => {
    const existing = {
      mood: 3,
      anxiety: 3,
      sleep_hours: 7,
      sleep_quality: 3,
      sleep_disturbances: null,
      activity_type: null,
      activity_duration: null,
      social_frequency: 3,
      stress_level: 3,
      symptoms: [],
    } as ExistingLog;

    expect(initialFormState(existing).disturbances).toEqual([]);
  });
});

describe("canAdvance", () => {
  const base = initialFormState();

  test("mood step requires mood > 0", () => {
    expect(canAdvance(0, base)).toBe(false);
    expect(canAdvance(0, { ...base, mood: 3 })).toBe(true);
  });

  test("social & stress step requires both fields set", () => {
    expect(canAdvance(4, { ...base, socialFrequency: 3 })).toBe(false);
    expect(canAdvance(4, { ...base, socialFrequency: 3, stressLevel: 2 })).toBe(true);
  });

  test("activity and symptoms steps have no required fields", () => {
    expect(canAdvance(3, base)).toBe(true);
    expect(canAdvance(5, base)).toBe(true);
  });
});

describe("buildLogPayload", () => {
  test("omits empty optional fields as undefined", () => {
    const state = initialFormState();
    const payload = buildLogPayload(state, "2026-08-20");

    expect(payload.sleepDisturbances).toBeUndefined();
    expect(payload.activityType).toBeUndefined();
    expect(payload.activityDuration).toBeUndefined();
    expect(payload.symptoms).toEqual([]);
  });

  test("joins disturbances and maps symptoms into name/severity pairs", () => {
    const state = {
      ...initialFormState(),
      disturbances: ["None", "Nightmares"],
      activityType: "Run",
      activityDuration: 30,
      symptoms: { "Low energy": 2 },
    };

    const payload = buildLogPayload(state, "2026-08-20");

    expect(payload.sleepDisturbances).toBe("None, Nightmares");
    expect(payload.activityType).toBe("Run");
    expect(payload.activityDuration).toBe(30);
    expect(payload.symptoms).toEqual([{ name: "Low energy", severity: 2 }]);
    expect(payload.date).toBe("2026-08-20");
  });
});

describe("toggleInList", () => {
  test("adds a value not present", () => {
    expect(toggleInList(["a"], "b")).toEqual(["a", "b"]);
  });
  test("removes a value already present", () => {
    expect(toggleInList(["a", "b"], "a")).toEqual(["b"]);
  });
});

describe("toggleSymptom", () => {
  test("adding a new symptom defaults severity to 1", () => {
    expect(toggleSymptom({}, "Irritability")).toEqual({ Irritability: 1 });
  });
  test("removing an existing symptom drops the key entirely", () => {
    expect(toggleSymptom({ Irritability: 2 }, "Irritability")).toEqual({});
  });
});
