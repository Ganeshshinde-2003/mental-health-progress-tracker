"use client";

type Props = {
  label: string;
  value: string;
  onEdit: () => void;
};

export function ReviewRow({ label, value, onEdit }: Props) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "var(--space-2) 0",
        borderBottom: "1px solid var(--color-divider)",
      }}
    >
      <div>
        <div className="text-muted" style={{ fontSize: 11, textTransform: "uppercase" }}>
          {label}
        </div>
        <div style={{ fontSize: 14 }}>{value}</div>
      </div>
      <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={onEdit}>
        Edit
      </button>
    </div>
  );
}
