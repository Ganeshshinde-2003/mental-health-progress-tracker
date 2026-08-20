"use client";

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div style={{ textAlign: "center" }}>
        <div className="loading-moon" style={{ fontSize: 40 }}>
          🌙
        </div>
        <p className="text-muted" style={{ fontSize: 13, marginTop: "var(--space-3)" }}>
          Just a moment
        </p>
      </div>
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
  );
}
