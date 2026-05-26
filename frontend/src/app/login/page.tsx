"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Alert, Box, Button, CircularProgress, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useAuth } from "@/components/AuthProvider";

type Notice = {
  severity: "info" | "success";
  text: string;
};

type EmailFollowUp = {
  mode: "signup" | "reset";
  email: string;
};

export default function LoginPage() {
  const { resendSignUpEmail, resetPasswordForEmail, signInWithPassword, signUpWithPassword } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [emailFollowUp, setEmailFollowUp] = useState<EmailFollowUp | null>(null);

  function changeMode(nextMode: "signin" | "signup" | "reset") {
    setMode(nextMode);
    setNotice(null);
    setError("");
    setEmailFollowUp(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice(null);
    setEmailFollowUp(null);
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (mode !== "reset" && password.length < 8) {
      setError("Please enter a password with at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "signin") {
        setNotice({ severity: "info", text: "Signing you in..." });
        await signInWithPassword(email.trim(), password);
        window.location.assign("/?auth=signed-in");
      } else if (mode === "signup") {
        const trimmedEmail = email.trim();
        setNotice({
          severity: "info",
          text: "Creating your account and sending the confirmation email. This can take a few seconds.",
        });
        const result = await signUpWithPassword(trimmedEmail, password);
        if (result.signedIn) {
          window.location.assign("/?auth=signed-in");
        } else {
          setEmailFollowUp({ mode: "signup", email: trimmedEmail });
          setNotice({
            severity: "success",
            text: "Account created. Please check your email to confirm the account before signing in.",
          });
        }
      } else {
        const trimmedEmail = email.trim();
        setNotice({ severity: "info", text: "Sending your password reset email. This can take a few seconds." });
        await resetPasswordForEmail(trimmedEmail);
        setEmailFollowUp({ mode: "reset", email: trimmedEmail });
        setNotice({ severity: "success", text: "Password reset email sent. Please check your inbox." });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete sign-in.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (!emailFollowUp) {
      return;
    }
    setError("");
    setNotice({
      severity: "info",
      text:
        emailFollowUp.mode === "signup"
          ? "Resending the confirmation email..."
          : "Resending the password reset email...",
    });
    setResending(true);
    try {
      if (emailFollowUp.mode === "signup") {
        await resendSignUpEmail(emailFollowUp.email);
        setNotice({ severity: "success", text: "Confirmation email resent. Please check your inbox." });
      } else {
        await resetPasswordForEmail(emailFollowUp.email);
        setNotice({ severity: "success", text: "Password reset email resent. Please check your inbox." });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend the email.");
    } finally {
      setResending(false);
    }
  }

  const submitLabel =
    mode === "signin"
      ? submitting
        ? "Signing in..."
        : "Sign in"
      : mode === "signup"
        ? submitting
          ? "Creating account..."
          : "Create account"
        : submitting
          ? "Sending reset link..."
          : "Send reset link";

  return (
    <Stack spacing={3} sx={{ maxWidth: 560 }}>
      <Box>
        <Typography variant="h3">Sign in</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Use your email and password for registration, My Events, and admin access.
        </Typography>
      </Box>
      {notice ? (
        <Alert
          severity={notice.severity}
          icon={notice.severity === "info" && (submitting || resending) ? <CircularProgress color="inherit" size={20} /> : undefined}
        >
          {notice.text}
        </Alert>
      ) : null}
      {error ? <Alert severity="warning">{error}</Alert> : null}
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Tabs value={mode} onChange={(_, value) => changeMode(value)} sx={{ mb: 2 }}>
          <Tab value="signin" label="Sign in" />
          <Tab value="signup" label="Create account" />
          <Tab value="reset" label="Forgot password" />
        </Tabs>
        <TextField
          fullWidth
          label="Email address"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        {mode !== "reset" ? (
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            sx={{ mt: 2 }}
          />
        ) : null}
        <Button fullWidth type="submit" variant="contained" size="large" disabled={submitting} sx={{ mt: 2 }}>
          {submitLabel}
        </Button>
        {emailFollowUp ? (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
            <Button type="button" variant="outlined" onClick={handleResend} disabled={resending || submitting}>
              {resending ? "Sending..." : "Send again"}
            </Button>
            <Button type="button" variant="text" onClick={() => changeMode("signin")} disabled={resending || submitting}>
              Back to sign in
            </Button>
          </Stack>
        ) : null}
      </Paper>
    </Stack>
  );
}
