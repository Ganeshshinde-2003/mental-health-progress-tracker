"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

/** Triggers a browser download of the given JSON payload. */
function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Export-my-data and delete-my-account actions, shared by the settings menu. */
export function useAccountActions() {
  const { signOut, getIdToken } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = async () => {
    const token = await getIdToken();
    if (!token) return;
    setExporting(true);
    setError(null);
    try {
      const data = await apiFetch("/api/export", token);
      downloadJson(data, "my-health-data.json");
    } catch (err) {
      console.error("Failed to export data:", err);
      setError("Couldn't export your data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const deleteAccount = async () => {
    const token = await getIdToken();
    if (!token) return;
    setDeleting(true);
    setError(null);
    try {
      await apiFetch("/api/auth/me", token, { method: "DELETE" });
      await signOut();
    } catch (err) {
      console.error("Failed to delete account:", err);
      setError("Couldn't delete your account. Please try again.");
      setDeleting(false);
    }
  };

  return { exporting, deleting, error, exportData, deleteAccount };
}
