"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/**
 * Redirects the visitor to wherever they belong based on auth/consent state,
 * relative to the page they're currently on. Each page passes what it
 * requires; anyone who doesn't meet it gets sent to the right place instead.
 */
export function useAuthRedirect(page: "login" | "consent" | "dashboard") {
  const { user, dbUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (page !== "login") router.replace("/login");
      return;
    }

    if (!dbUser) return; // still syncing with the backend

    const consented = Boolean(dbUser.consented_at);

    if (!consented && page !== "consent") {
      router.replace("/consent");
      return;
    }

    if (consented && page !== "dashboard") {
      router.replace("/");
    }
  }, [loading, user, dbUser, page, router]);

  return { user, dbUser, loading };
}
