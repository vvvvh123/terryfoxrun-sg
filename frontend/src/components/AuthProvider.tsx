"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AppRole = "participant" | "admin" | "volunteer";

type AuthContextValue = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  appRole: AppRole;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getAppRole(user: User | null): AppRole {
  const role = user?.app_metadata?.app_role;
  return role === "admin" || role === "volunteer" ? role : "participant";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      appRole: getAppRole(session?.user ?? null),
      async signInWithEmail(email: string) {
        const origin = window.location.origin;
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${origin}/auth/callback`,
          },
        });
        if (error) {
          throw error;
        }
      },
      async signOut() {
        await supabase.auth.signOut();
      },
    }),
    [loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
