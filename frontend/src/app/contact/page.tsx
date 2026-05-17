"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { EventDto, getCurrentEvent, submitContact } from "@/lib/api";

export default function ContactPage() {
  const [event, setEvent] = useState<EventDto | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getCurrentEvent()
      .then(setEvent)
      .catch(() => setError("Start the backend to submit the contact form."));
  }, []);

  async function handleSubmit() {
    if (!event) {
      setError("Event details are still loading.");
      return;
    }
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    try {
      await submitContact(event.id, form);
      setStatus("Thank you. Your message has been sent to the Terry Fox Run Singapore team.");
      setForm({ firstName: "", lastName: "", email: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit contact form.");
    }
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">Contact Us</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 720 }}>
          Send a question to the Terry Fox Run Singapore committee. The admin portal controls which email address receives these messages.
        </Typography>
      </Box>
      {status ? <Alert severity="success">{status}</Alert> : null}
      {error ? <Alert severity="warning">{error}</Alert> : null}
      <Paper sx={{ p: { xs: 2, md: 3 }, maxWidth: 880 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField required fullWidth label="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField required fullWidth label="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </Grid>
          <Grid item xs={12}>
            <TextField required fullWidth label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              multiline
              minRows={5}
              label="How can we help?"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" size="large" onClick={handleSubmit}>
              Send message
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );
}
