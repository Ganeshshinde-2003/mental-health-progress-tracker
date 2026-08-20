"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLogs } from "@/lib/hooks/useLogs";
import { useAccountActions } from "@/lib/hooks/useAccountActions";
import {
  getGreeting,
  filterToLastWeek,
  toChartData,
  findTodayLog,
  computeDelta,
} from "@/lib/dashboard-utils";
import { LogWizard, type ExistingLog } from "./LogWizard";
import { HeroBand } from "./dashboard/HeroBand";
import { TrendsSection } from "./dashboard/TrendsSection";
import { DeleteAccountDialog } from "./dashboard/DeleteAccountDialog";

export function Dashboard() {
  const { user, signOut } = useAuth();
  const { logs, loading, pulse, error: logsError, refetch } = useLogs();
  const {
    exporting,
    deleting,
    error: actionError,
    exportData,
    deleteAccount,
  } = useAccountActions();

  const [range, setRange] = useState<"week" | "month">("month");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [logOpen, setLogOpen] = useState(false);

  const greeting = getGreeting();
  const firstName = user?.displayName?.split(" ")[0] ?? "there";
  const todayLog = findTodayLog(logs);

  const chartData = useMemo(() => {
    const visible = range === "week" ? filterToLastWeek(logs) : logs;
    return toChartData(visible);
  }, [logs, range]);

  const moodDelta = useMemo(() => computeDelta(chartData, "mood"), [chartData]);
  const anxietyDelta = useMemo(() => computeDelta(chartData, "anxiety"), [chartData]);
  const stressDelta = useMemo(() => computeDelta(chartData, "stress"), [chartData]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HeroBand
        greeting={greeting}
        firstName={firstName}
        hasTodayLog={Boolean(todayLog)}
        exporting={exporting}
        onLogClick={() => setLogOpen(true)}
        onExport={exportData}
        onRequestDelete={() => setConfirmingDelete(true)}
        onSignOut={() => signOut()}
      />

      <div className="main">
        {(logsError || actionError) && (
          <div className="error-banner">
            <span>{logsError ?? actionError}</span>
            {logsError && (
              <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={refetch}>
                Retry
              </button>
            )}
          </div>
        )}
        {loading ? (
          <p className="text-muted">Loading your entries…</p>
        ) : logs.length === 0 ? (
          <div className="empty-state" style={{ textAlign: "center", padding: "var(--space-8)" }}>
            <div style={{ fontSize: 48, marginBottom: "var(--space-4)" }}>📝</div>
            <h2>No entries yet</h2>
            <p className="text-muted">Start tracking to see your progress</p>
            <button className="btn btn-primary" onClick={() => setLogOpen(true)}>
              Log your first entry
            </button>
          </div>
        ) : (
          <TrendsSection
            range={range}
            onRangeChange={setRange}
            chartData={chartData}
            pulse={pulse}
            moodDelta={moodDelta}
            anxietyDelta={anxietyDelta}
            stressDelta={stressDelta}
          />
        )}
      </div>

      {logOpen && (
        <LogWizard
          existingLog={todayLog as unknown as ExistingLog | undefined}
          onClose={() => setLogOpen(false)}
          onSaved={() => {
            setLogOpen(false);
            refetch();
          }}
        />
      )}

      {confirmingDelete && (
        <DeleteAccountDialog
          deleting={deleting}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={deleteAccount}
        />
      )}

      <style jsx>{`
        .pulse {
          animation: glow 1.5s ease;
        }
        @keyframes glow {
          0% {
            box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-accent) 40%, transparent);
          }
          50% {
            box-shadow: 0 0 24px 4px color-mix(in srgb, var(--color-accent) 40%, transparent);
          }
          100% {
            box-shadow: var(--shadow-md);
          }
        }
      `}</style>
    </div>
  );
}
