"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EventDto, PaymentAttempt, ShirtInventoryItem, SlideshowImage, confirmPayment, getCurrentEvent, getInventory, getPendingPayments, getSlideshow, saveSlideshow } from "@/lib/api";

export default function AdminPage() {
  const [event, setEvent] = useState<EventDto | null>(null);
  const [pendingPayments, setPendingPayments] = useState<PaymentAttempt[]>([]);
  const [inventory, setInventory] = useState<ShirtInventoryItem[]>([]);
  const [slides, setSlides] = useState<SlideshowImage[]>([]);
  const [adminTransactionId, setAdminTransactionId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadAdmin() {
    const current = await getCurrentEvent();
    setEvent(current);
    const [payments, inventoryItems, configuredSlides] = await Promise.all([
      getPendingPayments(),
      getInventory(current.id),
      getSlideshow(current.id),
    ]);
    setPendingPayments(payments);
    setInventory(inventoryItems);
    setSlides(configuredSlides.length ? configuredSlides : [{ imageUrl: "", blurb: "", displayOrder: 1, active: true }]);
  }

  useEffect(() => {
    loadAdmin().catch(() => setError("Start the backend to use admin tools."));
  }, []);

  const metrics = useMemo(() => {
    const remaining = inventory.reduce((sum, item) => sum + Number(item.quantityAvailable || 0), 0);
    return [
      { label: "Pending payments", value: pendingPayments.length },
      { label: "Stock remaining", value: remaining },
      { label: "Slideshow images", value: slides.filter((slide) => slide.active).length },
    ];
  }, [inventory, pendingPayments.length, slides]);

  async function handleConfirm(paymentAttemptId: number) {
    setError("");
    try {
      await confirmPayment(paymentAttemptId, adminTransactionId || `ADMIN-${paymentAttemptId}`);
      setMessage("Payment confirmed and inventory updated.");
      await loadAdmin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm payment.");
    }
  }

  function updateSlide(index: number, patch: Partial<SlideshowImage>) {
    setSlides((current) => current.map((slide, currentIndex) => (currentIndex === index ? { ...slide, ...patch } : slide)));
  }

  async function handleSaveSlides() {
    if (!event) return;
    await saveSlideshow(
      event.id,
      slides.map((slide, index) => ({ ...slide, displayOrder: index + 1, active: true })),
    );
    setMessage("Homepage slideshow saved.");
    await loadAdmin();
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">Admin Portal</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Operating tools for manual payment verification, slideshow updates, exports, and inventory visibility.
        </Typography>
      </Box>
      {error ? <Alert severity="warning">{error}</Alert> : null}
      {message ? <Alert severity="success">{message}</Alert> : null}
      <Grid container spacing={2}>
        {metrics.map((metric) => (
          <Grid item xs={12} md={4} key={metric.label}>
            <Paper sx={{ p: 3 }}>
              <Typography color="text.secondary">{metric.label}</Typography>
              <Typography variant="h3">{metric.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5">Payment verification queue</Typography>
            <TextField
              fullWidth
              label="Admin transaction ID / bank reference"
              value={adminTransactionId}
              onChange={(e) => setAdminTransactionId(e.target.value)}
              sx={{ mt: 2 }}
            />
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {pendingPayments.map((payment) => (
                <Box key={payment.id} sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2 }}>
                  <Typography fontWeight={800}>Registration #{payment.registrationId}</Typography>
                  <Typography color="text.secondary">
                    {payment.method} · user ref {payment.userTransactionId} · generated ref {payment.generatedReference}
                  </Typography>
                  <Button variant="contained" sx={{ mt: 1 }} onClick={() => handleConfirm(payment.id)}>
                    Confirm payment
                  </Button>
                </Box>
              ))}
              {!pendingPayments.length ? <Typography color="text.secondary">No pending payments.</Typography> : null}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h5">Inventory by size</Typography>
            <Box sx={{ height: 260, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="size" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantityAvailable" fill="#c91f2e" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <Paper sx={{ p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
          <Box>
            <Typography variant="h5">Homepage slideshow</Typography>
            <Typography color="text.secondary">Configure Terry Fox and past-run images plus short blurbs.</Typography>
          </Box>
          <Button variant="outlined" onClick={() => setSlides([...slides, { imageUrl: "", blurb: "", displayOrder: slides.length + 1, active: true }])}>
            Add image
          </Button>
        </Stack>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {slides.map((slide, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Box sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2 }}>
                <TextField fullWidth label="Image URL" value={slide.imageUrl} onChange={(e) => updateSlide(index, { imageUrl: e.target.value })} />
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Blurb"
                  value={slide.blurb}
                  onChange={(e) => updateSlide(index, { blurb: e.target.value })}
                  sx={{ mt: 2 }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
        <Button variant="contained" sx={{ mt: 2 }} onClick={handleSaveSlides}>
          Save slideshow
        </Button>
      </Paper>
    </Stack>
  );
}
