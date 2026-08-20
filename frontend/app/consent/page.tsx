"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useAuthRedirect } from "@/lib/hooks/useAuthRedirect";
import { apiFetch } from "@/lib/api";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function ConsentPage() {
  const { loading } = useAuthRedirect("consent");
  const { signOut, getIdToken, refreshDbUser } = useAuth();
  const [consentChecked, setConsentChecked] = useState(false);
  const [savingConsent, setSavingConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConsent = async () => {
    setSavingConsent(true);
    setError(null);
    try {
      const token = await getIdToken();
      if (!token) throw new Error("No token");
      await apiFetch("/api/auth/consent", token, { method: "POST" });
      await refreshDbUser();
    } catch {
      setError("Couldn't save consent. Please try again.");
    } finally {
      setSavingConsent(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="dialog-backdrop" style={{ position: "static", minHeight: "100vh" }}>
      <div className="dialog elev-lg" style={{ width: "min(500px, 100%)" }}>
        <h2 className="dialog-title">Your data, your choice</h2>
        <p className="dialog-body">
          MindTrack collects daily check-ins (mood, sleep, stress, and more) to help you
          see patterns over time. Your entries are private to your account, encrypted in
          transit, and never shared. This is not a diagnostic tool.
        </p>
        <label style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
          <input
            type="checkbox"
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
          />
          <span style={{ fontSize: 14 }}>I consent to logging my daily mental health data</span>
        </label>
        {error && <p style={{ color: "var(--color-accent-700)", fontSize: 13 }}>{error}</p>}
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={() => signOut()}>
            Back
          </button>
          <button
            className="btn btn-primary"
            disabled={!consentChecked || savingConsent}
            onClick={handleConsent}
          >
            {savingConsent ? "Saving…" : "Get started"}
          </button>
        </div>
      </div>
    </div>
  );
}
