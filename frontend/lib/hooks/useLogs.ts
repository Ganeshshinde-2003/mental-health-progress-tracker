"use client";

import { useCallback, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import type { Log } from "@/lib/dashboard-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Loads the authenticated user's logs and keeps them live via Socket.io.
 * Always fetches the full month; callers slice down to "week" client-side.
 */
export function useLogs() {
  const { getIdToken } = useAuth();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    const token = await getIdToken();
    if (!token) return;
    try {
      const data = await apiFetch(`/api/logs?range=month`, token);
      setLogs(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load logs:", err);
      setError("Couldn't load your entries. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    // fetchLogs is async; its setState calls happen after an await, not synchronously here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    let socket: Socket | undefined;

    const connect = async () => {
      const token = await getIdToken();
      if (!token) return;
      socket = io(API_URL!, { auth: { token } });
      socket.on("newLog", () => {
        setPulse(true);
        fetchLogs();
        setTimeout(() => setPulse(false), 1500);
      });
    };
    connect();

    return () => {
      socket?.disconnect();
    };
  }, [getIdToken, fetchLogs]);

  return { logs, loading, pulse, error, refetch: fetchLogs };
}
