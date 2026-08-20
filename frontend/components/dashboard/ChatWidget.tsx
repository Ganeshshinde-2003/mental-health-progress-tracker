"use client";

import { useState } from "react";
import { useChatAssistant } from "@/lib/hooks/useChatAssistant";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, remaining, sending, error, send, limit } = useChatAssistant();

  const exhausted = remaining === 0;

  const handleSend = () => {
    const text = input.trim();
    if (!text || sending || exhausted) return;
    setInput("");
    send(text);
  };

  return (
    <>
      <button
        className="btn btn-primary chat-fab"
        aria-label="Ask the wellness assistant"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="chat-panel card elev-lg">
          <div className="chat-header">
            <div>
              <h4 style={{ margin: 0 }}>Wellness assistant</h4>
              <p className="text-muted" style={{ fontSize: 12, margin: 0 }}>
                {remaining === null ? "…" : `${remaining}/${limit} free messages left`}
              </p>
            </div>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <p className="text-muted" style={{ fontSize: 13 }}>
                Ask me anything about your logged mood, sleep, or stress patterns. I&apos;m not a
                therapist, just here to help you notice trends.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble chat-bubble-${m.role}`}>
                {m.text}
              </div>
            ))}
            {sending && <div className="chat-bubble chat-bubble-assistant">Thinking…</div>}
          </div>

          {error && (
            <p style={{ color: "var(--color-accent-700)", fontSize: 12, margin: 0 }}>{error}</p>
          )}

          <div className="chat-input-row">
            <input
              className="input"
              placeholder={exhausted ? "You're out of free messages" : "Type a message…"}
              value={input}
              disabled={sending || exhausted}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              className="btn btn-primary"
              disabled={sending || exhausted || !input.trim()}
              onClick={handleSend}
            >
              Send
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .chat-fab {
          position: fixed;
          bottom: var(--space-6);
          right: var(--space-6);
          width: 52px;
          height: 52px;
          border-radius: 999px;
          font-size: 20px;
          padding: 0;
          box-shadow: var(--shadow-lg);
          z-index: 20;
        }
        .chat-panel {
          position: fixed;
          bottom: calc(var(--space-6) + 64px);
          right: var(--space-6);
          width: min(340px, calc(100vw - var(--space-6) * 2));
          max-height: min(480px, calc(100vh - 160px));
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          padding: var(--space-4);
          z-index: 20;
        }
        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .chat-messages {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .chat-bubble {
          font-size: 13px;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          max-width: 85%;
          white-space: pre-wrap;
        }
        .chat-bubble-user {
          align-self: flex-end;
          background: var(--color-accent);
          color: var(--color-bg);
        }
        .chat-bubble-assistant {
          align-self: flex-start;
          background: var(--color-neutral-200);
        }
        .chat-input-row {
          display: flex;
          gap: var(--space-2);
        }
        .chat-input-row .input {
          flex: 1;
        }
      `}</style>
    </>
  );
}
