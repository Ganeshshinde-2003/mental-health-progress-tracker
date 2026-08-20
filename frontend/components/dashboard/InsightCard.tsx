"use client";

type Props = {
  insight: string | null;
  loading: boolean;
};

export function InsightCard({ insight, loading }: Props) {
  if (!loading && !insight) return null;

  return (
    <div className="card elev-md insight-card">
      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
        <span style={{ fontSize: 22, lineHeight: 1 }}>✨</span>
        {loading ? (
          <div className="insight-skeleton" style={{ flex: 1 }} />
        ) : (
          <p style={{ margin: 0, fontSize: 14 }}>{insight}</p>
        )}
      </div>

      <style jsx>{`
        .insight-card {
          background: linear-gradient(
            135deg,
            color-mix(in srgb, var(--color-accent) 12%, var(--color-surface)) 0%,
            color-mix(in srgb, var(--color-accent-2) 12%, var(--color-surface)) 100%
          );
          padding: var(--space-4);
        }
        .insight-skeleton {
          height: 14px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--color-text) 12%, transparent);
          animation: pulse-skeleton 1.4s ease-in-out infinite;
        }
        @keyframes pulse-skeleton {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
