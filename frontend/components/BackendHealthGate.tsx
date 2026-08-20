"use client";

import type { ReactNode } from "react";
import { useBackendHealth } from "@/lib/hooks/useBackendHealth";
import { WakingUpScreen } from "./WakingUpScreen";
import { LoadingScreen } from "./LoadingScreen";

export function BackendHealthGate({ children }: { children: ReactNode }) {
  const { healthy, elapsedSeconds } = useBackendHealth();

  if (healthy === null) return <LoadingScreen />;
  if (healthy === false) return <WakingUpScreen elapsedSeconds={elapsedSeconds} />;

  return <>{children}</>;
}
