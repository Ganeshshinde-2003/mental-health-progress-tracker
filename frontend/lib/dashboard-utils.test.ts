import { describe, test, expect } from "vitest";
import {
  getGreeting,
  todayDateStr,
  filterToLastWeek,
  toChartData,
  findTodayLog,
  computeDelta,
  describeDelta,
  type Log,
} from "./dashboard-utils";

describe("getGreeting", () => {
  test("returns morning before noon", () => {
    expect(getGreeting(9)).toBe("Good morning");
  });
  test("returns afternoon between noon and 6pm", () => {
    expect(getGreeting(14)).toBe("Good afternoon");
  });
  test("returns evening after 6pm", () => {
    expect(getGreeting(20)).toBe("Good evening");
  });
});

describe("todayDateStr", () => {
  test("formats as YYYY-MM-DD", () => {
    expect(todayDateStr(new Date("2026-08-20T15:30:00Z"))).toBe("2026-08-20");
  });
});

function makeLog(date: string, overrides: Partial<Log> = {}): Log {
  return {
    id: 1,
    date,
    mood: 3,
    anxiety: 3,
    stress_level: 3,
    sleep_hours: 7,
    ...overrides,
  };
}

describe("filterToLastWeek", () => {
  const now = new Date("2026-08-20T00:00:00Z");

  test("excludes logs older than 7 days", () => {
    const logs = [makeLog("2026-08-01"), makeLog("2026-08-15"), makeLog("2026-08-20")];
    const result = filterToLastWeek(logs, now);
    expect(result.map((l) => l.date)).toEqual(["2026-08-15", "2026-08-20"]);
  });

  test("returns empty array when no logs are within range", () => {
    const logs = [makeLog("2026-01-01")];
    expect(filterToLastWeek(logs, now)).toEqual([]);
  });

  test("includes exactly 7 days: today and the 6 days before it", () => {
    const logs = [
      makeLog("2026-08-13"), // 7 days before "now" -> just outside the window
      makeLog("2026-08-14"), // 6 days before -> boundary, included
      makeLog("2026-08-20"), // today
    ];
    const result = filterToLastWeek(logs, now);
    expect(result.map((l) => l.date)).toEqual(["2026-08-14", "2026-08-20"]);
  });
});

describe("toChartData", () => {
  test("maps logs to chart points with short date and renamed fields", () => {
    const logs = [makeLog("2026-08-20", { mood: 4, anxiety: 2, stress_level: 1, sleep_hours: 8 })];
    expect(toChartData(logs)).toEqual([
      { date: "08-20", mood: 4, anxiety: 2, stress: 1, sleep: 8 },
    ]);
  });
});

describe("findTodayLog", () => {
  const now = new Date("2026-08-20T12:00:00Z");

  test("finds the log matching today's date", () => {
    const logs = [makeLog("2026-08-19"), makeLog("2026-08-20")];
    expect(findTodayLog(logs, now)?.date).toBe("2026-08-20");
  });

  test("returns undefined when no log exists for today", () => {
    const logs = [makeLog("2026-08-19")];
    expect(findTodayLog(logs, now)).toBeUndefined();
  });
});

describe("computeDelta", () => {
  test("returns 0 with fewer than two points", () => {
    expect(computeDelta(toChartData([makeLog("2026-08-20")]), "mood")).toBe(0);
    expect(computeDelta([], "mood")).toBe(0);
  });

  test("returns the difference between the last two points", () => {
    const chartData = toChartData([
      makeLog("2026-08-19", { mood: 2 }),
      makeLog("2026-08-20", { mood: 5 }),
    ]);
    expect(computeDelta(chartData, "mood")).toBe(3);
  });
});

describe("describeDelta", () => {
  test("flat delta shows a right arrow, neutral color", () => {
    expect(describeDelta(0)).toEqual({ arrow: "→", colorVar: "var(--color-text)" });
  });

  test("positive delta is 'improving' by default (higher is better)", () => {
    const result = describeDelta(2);
    expect(result.arrow).toBe("↑");
    expect(result.colorVar).toBe("var(--color-accent-2-700)");
  });

  test("positive delta is 'worsening' when lowerIsBetter (e.g. stress going up)", () => {
    const result = describeDelta(2, true);
    expect(result.arrow).toBe("↑");
    expect(result.colorVar).toBe("var(--color-accent-700)");
  });

  test("negative delta with lowerIsBetter is improving", () => {
    const result = describeDelta(-1, true);
    expect(result.arrow).toBe("↓");
    expect(result.colorVar).toBe("var(--color-accent-2-700)");
  });
});
