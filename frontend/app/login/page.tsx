"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useAuthRedirect } from "@/lib/hooks/useAuthRedirect";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function LoginPage() {
  const { loading } = useAuthRedirect("login");
  const { signInWithGoogle } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch {
      setError("Sign-in failed. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 64, marginBottom: "var(--space-6)" }}>🌙</div>
        <h1>MindTrack</h1>
        <p className="text-muted">A quiet place to track how you&apos;re doing</p>
        <button
          className="btn btn-primary btn-block"
          onClick={handleLogin}
          disabled={signingIn}
        >
          {signingIn ? "Signing in…" : "Continue with Google"}
        </button>
        {error && <p style={{ color: "var(--color-accent-700)", fontSize: 13 }}>{error}</p>}
        <p className="text-muted" style={{ fontSize: 12, marginTop: "var(--space-6)" }}>
          Not a diagnostic tool. Your data is private and encrypted.
        </p>
      </div>
    </div>
  );
}
