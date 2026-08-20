export type Log = {
  id: number;
  date: string;
  mood: number;
  anxiety: number;
  stress_level: number;
  sleep_hours: number;
  [key: string]: unknown;
};

export type ChartPoint = {
  date: string;
  mood: number;
  anxiety: number;
  stress: number;
  sleep: number;
};

export function getGreeting(hour: number = new Date().getHours()): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function todayDateStr(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Logs from today and the 6 days before it (7 days total, inclusive of today). */
export function filterToLastWeek(logs: Log[], now: Date = new Date()): Log[] {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 6);
  const cutoffStr = todayDateStr(cutoff);
  return logs.filter((l) => l.date >= cutoffStr);
}

export function toChartData(logs: Log[]): ChartPoint[] {
  return logs.map((l) => ({
    date: l.date.slice(5),
    mood: l.mood,
    anxiety: l.anxiety,
    stress: l.stress_level,
    sleep: l.sleep_hours,
  }));
}

export function findTodayLog(logs: Log[], now: Date = new Date()): Log | undefined {
  const today = todayDateStr(now);
  return logs.find((l) => l.date === today);
}

/** Change in a metric between the last two chart points; 0 if fewer than two exist. */
export function computeDelta(
  chartData: ChartPoint[],
  key: "mood" | "anxiety" | "stress"
): number {
  const latest = chartData[chartData.length - 1];
  const previous = chartData[chartData.length - 2];
  if (!latest || !previous) return 0;
  return latest[key] - previous[key];
}

export type DeltaDisplay = {
  arrow: "→" | "↑" | "↓";
  colorVar: string;
};

/**
 * How to render a delta arrow. For most metrics, up = improving (mood).
 * Pass lowerIsBetter for metrics where a drop is the good direction
 * (anxiety, stress).
 */
export function describeDelta(delta: number, lowerIsBetter = false): DeltaDisplay {
  if (delta === 0) return { arrow: "→", colorVar: "var(--color-text)" };

  const improving = lowerIsBetter ? delta < 0 : delta > 0;
  return {
    arrow: delta > 0 ? "↑" : "↓",
    colorVar: improving ? "var(--color-accent-2-700)" : "var(--color-accent-700)",
  };
}
