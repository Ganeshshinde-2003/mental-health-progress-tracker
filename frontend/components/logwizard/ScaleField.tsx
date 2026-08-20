"use client";

import { Tooltip } from "../Tooltip";

type Props = {
  value: number;
  onChange: (v: number) => void;
  emoji: string[];
  label?: string;
  tooltip?: string;
  compact?: boolean;
};

export function ScaleField({ value, onChange, emoji, label, tooltip, compact }: Props) {
  return (
    <div>
      {(label || tooltip) && (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            fontWeight: 600,
            marginBottom: "var(--space-2)",
          }}
        >
          {label}
          {tooltip && <Tooltip text={tooltip} />}
        </span>
      )}
      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        {emoji.map((e, i) => {
          const v = i + 1;
          const active = value === v;
          return (
            <button
              key={v}
              type="button"
              className="btn"
              style={{
                flex: 1,
                aspectRatio: "1",
                fontSize: compact ? 20 : 24,
                border: `2px solid ${active ? "var(--color-accent)" : "var(--color-divider)"}`,
                background: active ? "var(--color-accent-100)" : "transparent",
              }}
              onClick={() => onChange(v)}
            >
              {e}
            </button>
          );
        })}
      </div>
    </div>
  );
}
