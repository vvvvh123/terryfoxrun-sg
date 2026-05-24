"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Alert, Box, Button, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const { resetPasswordForEmail, signInWithPassword, signUpWithPassword } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
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
        await signInWithPassword(email.trim(), password);
        window.location.assign("/?auth=signed-in");
      } else if (mode === "signup") {
        const result = await signUpWithPassword(email.trim(), password);
        if (result.signedIn) {
          window.location.assign("/?auth=signed-in");
        } else {
          setMessage("Account created. Please check your email to confirm the account before signing in.");
        }
      } else {
        await resetPasswordForEmail(email.trim());
        setMessage("Check your email for the password reset link.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete sign-in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 560 }}>
      <Box>
        <Typography variant="h3">Sign in</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Use your email and password for registration, My Events, and admin access.
        </Typography>
      </Box>
      {message ? <Alert severity="success">{message}</Alert> : null}
      {error ? <Alert severity="warning">{error}</Alert> : null}
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Tabs value={mode} onChange={(_, value) => setMode(value)} sx={{ mb: 2 }}>
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
          {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
        </Button>
      </Paper>
    </Stack>
  );
}
