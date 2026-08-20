"use client";

import { useState } from "react";

type Props = {
  exporting: boolean;
  onExport: () => void;
  onRequestDelete: () => void;
  onSignOut: () => void;
};

export function SettingsMenu({ exporting, onExport, onRequestDelete, onSignOut }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        aria-label="Settings"
        className="btn"
        style={{
          borderRadius: 999,
          width: 36,
          height: 36,
          padding: 0,
          color: "var(--color-bg)",
          fontSize: 18,
        }}
        onClick={() => setOpen((v) => !v)}
      >
        ⚙️
      </button>
      {open && (
        <div
          className="card elev-lg"
          style={{
            position: "absolute",
            right: 0,
            top: 44,
            width: 200,
            padding: "var(--space-2)",
            gap: 0,
            zIndex: 10,
            color: "var(--color-text)",
          }}
        >
          <button
            className="btn"
            style={{ width: "100%", justifyContent: "flex-start", fontSize: 13 }}
            onClick={() => {
              setOpen(false);
              onExport();
            }}
            disabled={exporting}
          >
            {exporting ? "Exporting…" : "Export my data"}
          </button>
          <button
            className="btn"
            style={{
              width: "100%",
              justifyContent: "flex-start",
              fontSize: 13,
              color: "var(--color-accent-700)",
            }}
            onClick={() => {
              setOpen(false);
              onRequestDelete();
            }}
          >
            Delete my account
          </button>
          <div className="hr" style={{ margin: "var(--space-1) 0" }} />
          <button
            className="btn"
            style={{ width: "100%", justifyContent: "flex-start", fontSize: 13 }}
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
