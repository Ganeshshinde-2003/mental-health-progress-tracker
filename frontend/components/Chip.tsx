"use client";

export function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="tag"
      style={{
        cursor: "pointer",
        border: `1px solid ${active ? "var(--color-accent)" : "var(--color-divider)"}`,
        background: active ? "var(--color-accent-100)" : "transparent",
        color: active ? "var(--color-accent-800)" : "var(--color-text)",
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
