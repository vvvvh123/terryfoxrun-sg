"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { createCorporateOrder, getCurrentEvent } from "@/lib/api";

const shirtSizes = ["XS", "S", "M", "L", "XL", "XXL"];

export default function CorporatePage() {
  const [eventId, setEventId] = useState<number | null>(null);
  const [form, setForm] = useState({
    companyName: "",
    companyAddress: "",
    uen: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getCurrentEvent()
      .then((event) => setEventId(event.id))
      .catch(() => setError("Start the backend to submit corporate orders."));
  }, []);

  async function handleSubmit() {
    if (!eventId) return;
    setError("");
    try {
      const id = await createCorporateOrder({
        eventId,
        ...form,
        items: shirtSizes
          .map((size) => ({ size, type: "adult", quantity: Number(quantities[size] || 0) }))
          .filter((item) => item.quantity > 0),
      });
      setMessage(`Corporate order #${id} submitted. Admin will follow up for PayNow or bank transfer confirmation.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Corporate order failed.");
    }
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">Corporate Orders</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Bulk shirt-only ordering for companies, with offline payment follow-up and admin export support.
        </Typography>
      </Box>
      {message ? <Alert severity="success">{message}</Alert> : null}
      {error ? <Alert severity="warning">{error}</Alert> : null}
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5">Company details</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {[
                ["companyName", "Company name"],
                ["uen", "UEN"],
                ["contactName", "Contact name"],
                ["contactEmail", "Contact email"],
                ["contactPhone", "Contact phone"],
                ["companyAddress", "Company address"],
              ].map(([key, label]) => (
                <Grid item xs={12} sm={key === "companyAddress" ? 12 : 6} key={key}>
                  <TextField fullWidth label={label} value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5">Shirt quantities</Typography>
            <Grid container spacing={1.5} sx={{ mt: 1 }}>
              {shirtSizes.map((size) => (
                <Grid item xs={6} key={size}>
                  <TextField
                    fullWidth
                    type="number"
                    label={size}
                    value={quantities[size] ?? 0}
                    onChange={(e) => setQuantities({ ...quantities, [size]: Math.max(0, Number(e.target.value)) })}
                  />
                </Grid>
              ))}
            </Grid>
            <Button fullWidth variant="contained" size="large" sx={{ mt: 2 }} disabled={!eventId} onClick={handleSubmit}>
              Submit corporate order
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
