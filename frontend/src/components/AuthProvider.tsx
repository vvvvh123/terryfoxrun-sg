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
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string) => Promise<{ signedIn: boolean }>;
  resetPasswordForEmail: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_TIMEOUT_MS = 20000;

function authErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === "object" && error !== null) {
    const maybeMessage = "message" in error ? error.message : null;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage;
    }
    const maybeErrorDescription = "error_description" in error ? error.error_description : null;
    if (typeof maybeErrorDescription === "string" && maybeErrorDescription.trim()) {
      return maybeErrorDescription;
    }
  }
  return fallback;
}

async function withAuthTimeout<T>(operation: Promise<T>, action: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new Error(
          `${action} took too long. Please try again; if it keeps happening, check the Supabase Auth email/SMTP settings.`,
        ),
      );
    }, AUTH_TIMEOUT_MS);
  });

  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

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
      async signInWithPassword(email: string, password: string) {
        const { error } = await withAuthTimeout(
          supabase.auth.signInWithPassword({ email, password }),
          "Signing in",
        );
        if (error) {
          throw new Error(authErrorMessage(error, "Could not sign in. Please check your email and password."));
        }
      },
      async signUpWithPassword(email: string, password: string) {
        const origin = window.location.origin;
        const { data, error } = await withAuthTimeout(
          supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${origin}/auth/callback`,
            },
          }),
          "Creating the account",
        );
        if (error) {
          throw new Error(authErrorMessage(error, "Could not create the account. Please try again."));
        }
        return { signedIn: Boolean(data.session) };
      },
      async resetPasswordForEmail(email: string) {
        const origin = window.location.origin;
        const { error } = await withAuthTimeout(
          supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/auth/callback?next=/reset-password`,
          }),
          "Sending the reset email",
        );
        if (error) {
          throw new Error(authErrorMessage(error, "Could not send the reset email. Please try again."));
        }
      },
      async updatePassword(password: string) {
        const { error } = await withAuthTimeout(supabase.auth.updateUser({ password }), "Updating the password");
        if (error) {
          throw new Error(authErrorMessage(error, "Could not update the password. Please try again."));
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
