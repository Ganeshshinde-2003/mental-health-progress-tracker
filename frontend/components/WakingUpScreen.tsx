"use client";

type Props = {
  elapsedSeconds: number;
};

export function WakingUpScreen({ elapsedSeconds }: Props) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div style={{ textAlign: "center", maxWidth: 360, padding: "var(--space-4)" }}>
        <div className="loading-moon" style={{ fontSize: 40 }}>
          🌙
        </div>
        <h2 style={{ marginTop: "var(--space-4)" }}>Waking up the server</h2>
        <p className="text-muted" style={{ fontSize: 13 }}>
          Our free-tier backend naps when idle. Give it a moment, it&apos;s starting up now.
        </p>
        <p className="text-muted" style={{ fontSize: 12, marginTop: "var(--space-3)" }}>
          {elapsedSeconds}s elapsed
        </p>
        <style jsx>{`
          .loading-moon {
            animation: drift 1.8s ease-in-out infinite;
          }
          @keyframes drift {
            0%,
            100% {
              transform: translateY(0);
              opacity: 0.6;
            }
            50% {
              transform: translateY(-6px);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
