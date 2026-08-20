"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

/** Loads the AI-generated one-line insight for the user's recent logs. */
export function useInsight(logsCount: number) {
  const { getIdToken } = useAuth();
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInsight = useCallback(async () => {
    const token = await getIdToken();
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiFetch("/api/insight", token);
      setInsight(data.insight);
    } catch (err) {
      console.error("Failed to load insight:", err);
      setInsight(null);
    } finally {
      setLoading(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    if (logsCount < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    fetchInsight();
    // Only re-fetch when the log count changes (a new entry was added), not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsCount]);

  return { insight, loading };
}
