"use client";

import { SettingsMenu } from "./SettingsMenu";

type Props = {
  greeting: string;
  firstName: string;
  hasTodayLog: boolean;
  exporting: boolean;
  onLogClick: () => void;
  onExport: () => void;
  onRequestDelete: () => void;
  onSignOut: () => void;
};

export function HeroBand({
  greeting,
  firstName,
  hasTodayLog,
  exporting,
  onLogClick,
  onExport,
  onRequestDelete,
  onSignOut,
}: Props) {
  return (
    <div className="hero-band" style={{ position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="hero-branding">🌙 MindTrack</div>
        <SettingsMenu
          exporting={exporting}
          onExport={onExport}
          onRequestDelete={onRequestDelete}
          onSignOut={onSignOut}
        />
      </div>
      <div className="hero-greeting">
        <h1>
          {greeting}, {firstName}
        </h1>
        <p>A quiet place to track how you&apos;re doing</p>
      </div>
      <button
        className="btn btn-primary"
        style={{ borderRadius: 999, marginTop: "var(--space-4)" }}
        onClick={onLogClick}
      >
        {hasTodayLog ? "Edit today's log" : "+ Log today"}
      </button>
    </div>
  );
}
