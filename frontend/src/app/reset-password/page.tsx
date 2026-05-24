"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useAuth } from "@/components/AuthProvider";

export default function ResetPasswordPage() {
  const { updatePassword, user } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!user) {
      setError("Open this page from the password reset email link.");
      return;
    }
    if (password.length < 8) {
      setError("Please enter a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await updatePassword(password);
      setMessage("Password updated. You can now use it to sign in.");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 560 }}>
      <Box>
        <Typography variant="h3">Reset password</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Choose a new password for your Terry Fox Run Singapore account.
        </Typography>
      </Box>
      {message ? <Alert severity="success">{message}</Alert> : null}
      {error ? <Alert severity="warning">{error}</Alert> : null}
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <TextField
          fullWidth
          label="New password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <TextField
          fullWidth
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          sx={{ mt: 2 }}
        />
        <Button fullWidth type="submit" variant="contained" size="large" disabled={submitting} sx={{ mt: 2 }}>
          Update password
        </Button>
      </Paper>
    </Stack>
  );
}
