"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const { signInWithEmail, user } = useAuth();
  const [email, setEmail] = useState("");
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
    setSubmitting(true);
    try {
      await signInWithEmail(email.trim());
      setMessage("Check your email for the sign-in link.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the sign-in link.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 560 }}>
      <Box>
        <Typography variant="h3">Sign in</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Use email magic link sign-in for registration, My Events, and admin access.
        </Typography>
      </Box>
      {user ? <Alert severity="success">You are signed in as {user.email}.</Alert> : null}
      {message ? <Alert severity="success">{message}</Alert> : null}
      {error ? <Alert severity="warning">{error}</Alert> : null}
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <TextField
          fullWidth
          label="Email address"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Button fullWidth type="submit" variant="contained" size="large" disabled={submitting} sx={{ mt: 2 }}>
          Send sign-in link
        </Button>
      </Paper>
    </Stack>
  );
}
