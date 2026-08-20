"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { apiFetch } from "./api";

type DbUser = {
  id: number;
  firebase_uid: string;
  email: string;
  display_name: string | null;
  consented_at: string | null;
  created_at: string;
};

type AuthContextValue = {
  user: User | null;
  dbUser: DbUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  refreshDbUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDbUser = async (firebaseUser: User) => {
    try {
      const token = await firebaseUser.getIdToken();
      // Registers/finds the user row in our DB via the auth middleware.
      const data = await apiFetch("/api/auth/me", token);
      setDbUser(data.user);
    } catch (err) {
      console.error("Failed to sync user with backend:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        await fetchDbUser(firebaseUser);
      } else {
        setDbUser(null);
      }
    });
    return unsubscribe;
  }, []);

  const refreshDbUser = async () => {
    if (auth.currentUser) await fetchDbUser(auth.currentUser);
  };

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const getIdToken = async () => {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  };

  return (
    <AuthContext.Provider
      value={{ user, dbUser, loading, signInWithGoogle, signOut, getIdToken, refreshDbUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
