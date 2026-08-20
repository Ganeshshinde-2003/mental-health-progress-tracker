"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";
import { Chip } from "../Chip";
import { Tooltip as InfoTooltip } from "../Tooltip";
import { TrendTile } from "./TrendTile";
import { describeDelta, type ChartPoint } from "@/lib/dashboard-utils";

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: "var(--color-neutral-900)",
    border: "none",
    borderRadius: 8,
    color: "var(--color-bg)",
    fontSize: 12,
  },
  labelStyle: { color: "var(--color-bg)" },
};

type Props = {
  range: "week" | "month";
  onRangeChange: (range: "week" | "month") => void;
  chartData: ChartPoint[];
  pulse: boolean;
  moodDelta: number;
  anxietyDelta: number;
  stressDelta: number;
};

export function TrendsSection({
  range,
  onRangeChange,
  chartData,
  pulse,
  moodDelta,
  anxietyDelta,
  stressDelta,
}: Props) {
  const latest = chartData[chartData.length - 1];
  const mood = describeDelta(moodDelta);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Your trends</h3>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Chip label="Week" active={range === "week"} onClick={() => onRangeChange("week")} />
          <Chip label="Month" active={range === "month"} onClick={() => onRangeChange("month")} />
        </div>
      </div>

      <div className="trends-grid">
        <div className={`card elev-md ${pulse ? "pulse" : ""}`} style={{ padding: "var(--space-6)" }}>
          <div className="card-kicker">Primary</div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "var(--space-4)",
            }}
          >
            <h4 style={{ margin: 0 }}>Mood</h4>
            <span
              style={{
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                color: mood.colorVar,
              }}
            >
              {mood.arrow} {Math.abs(moodDelta).toFixed(0)}
              <InfoTooltip text="Change vs. your previous entry." placement="top-left" />
            </span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" stroke="var(--color-text)" fontSize={12} />
              <YAxis domain={[1, 5]} stroke="var(--color-text)" fontSize={12} />
              <ChartTooltip {...CHART_TOOLTIP_STYLE} />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="var(--color-accent)"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="trends-side">
          <TrendTile
            title="Anxiety"
            dataKey="anxiety"
            color="var(--color-accent-2)"
            data={chartData}
            latest={latest?.anxiety}
            delta={anxietyDelta}
            lowerIsBetter
          />
          <TrendTile
            title="Stress"
            dataKey="stress"
            color="#8c491a"
            data={chartData}
            latest={latest?.stress}
            delta={stressDelta}
            lowerIsBetter
          />
        </div>
      </div>

      <div className="card elev-md" style={{ padding: "var(--space-6)" }}>
        <div className="card-kicker">Supporting</div>
        <h4 style={{ margin: "0 0 var(--space-4)" }}>Sleep (hours)</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <XAxis dataKey="date" stroke="var(--color-text)" fontSize={12} />
            <YAxis domain={[0, 12]} stroke="var(--color-text)" fontSize={12} />
            <ChartTooltip {...CHART_TOOLTIP_STYLE} />
            <Bar dataKey="sleep" fill="var(--color-accent-400)" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
