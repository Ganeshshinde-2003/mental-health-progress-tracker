"use client";

import { useAuthRedirect } from "@/lib/hooks/useAuthRedirect";
import { Dashboard } from "@/components/Dashboard";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function DashboardPage() {
  const { loading, user, dbUser } = useAuthRedirect("dashboard");

  if (loading || !user || !dbUser?.consented_at) {
    return <LoadingScreen />;
  }

  return <Dashboard />;
}
