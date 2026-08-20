"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const POLL_INTERVAL_MS = 5000;

/** Polls the backend's /health endpoint until it responds ok. */
export function useBackendHealth() {
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = setInterval(() => {
      if (!cancelled) setElapsedSeconds((s) => s + 1);
    }, 1000);

    const check = async () => {
      try {
        const res = await fetch(`${API_URL}/health`);
        if (cancelled) return;
        if (res.ok) {
          setHealthy(true);
          clearInterval(tick);
          return;
        }
        setHealthy(false);
        timer = setTimeout(check, POLL_INTERVAL_MS);
      } catch {
        if (cancelled) return;
        setHealthy(false);
        timer = setTimeout(check, POLL_INTERVAL_MS);
      }
    };

    check();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearInterval(tick);
    };
  }, []);

  return { healthy, elapsedSeconds };
}
