"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

export type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

const CHAT_LIMIT = 10;

/** Drives the AI chat assistant: message history, remaining quota, send. */
export function useChatAssistant() {
  const { getIdToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuota = useCallback(async () => {
    const token = await getIdToken();
    if (!token) return;
    try {
      const data = await apiFetch("/api/chat/quota", token);
      setRemaining(data.remaining);
    } catch (err) {
      console.error("Failed to load chat quota:", err);
    }
  }, [getIdToken]);

  useEffect(() => {
    // fetchQuota is async; its setState calls happen after an await, not synchronously here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchQuota();
  }, [fetchQuota]);

  const send = async (text: string) => {
    const token = await getIdToken();
    if (!token || !text.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setSending(true);
    setError(null);
    try {
      const data = await apiFetch("/api/chat", token, {
        method: "POST",
        body: JSON.stringify({ message: text }),
      });
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
      setRemaining(data.remaining);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setSending(false);
    }
  };

  return { messages, remaining, sending, error, send, limit: CHAT_LIMIT };
}
