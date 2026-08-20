"use client";

import { LineChart, Line, XAxis, Tooltip as ChartTooltip, ResponsiveContainer } from "recharts";
import { Tooltip as InfoTooltip } from "../Tooltip";
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
  title: string;
  dataKey: "anxiety" | "stress";
  color: string;
  data: ChartPoint[];
  latest?: number;
  delta: number;
  lowerIsBetter?: boolean;
};

export function TrendTile({ title, dataKey, color, data, latest, delta, lowerIsBetter }: Props) {
  const { arrow, colorVar } = describeDelta(delta, lowerIsBetter);

  return (
    <div className="card elev-md" style={{ padding: "var(--space-4)", flex: 1 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "var(--space-2)",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
        <span style={{ fontSize: 12, color: colorVar, display: "flex", alignItems: "center" }}>
          {arrow} {Math.abs(delta).toFixed(0)}
          <InfoTooltip text="Change vs. your previous entry." placement="top-left" />
        </span>
      </div>
      <div
        style={{ fontSize: 24, fontFamily: "var(--font-heading)", marginBottom: "var(--space-2)" }}
      >
        {latest ?? "-"}
        <span style={{ fontSize: 13, opacity: 0.6 }}>/5</span>
      </div>
      <ResponsiveContainer width="100%" height={60}>
        <LineChart data={data}>
          <XAxis dataKey="date" hide />
          <ChartTooltip {...CHART_TOOLTIP_STYLE} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
