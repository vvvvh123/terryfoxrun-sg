"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  EventDto,
  PaymentAttempt,
  ShirtInventoryItem,
  SlideshowImage,
  confirmPayment,
  exportCsvUrl,
  getCurrentEvent,
  getInventory,
  getPaymentAttempts,
  getSlideshow,
  rejectPayment,
  saveSlideshow,
} from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

function formatMoney(cents?: number) {
  return new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format((cents ?? 0) / 100);
}

export default function AdminPage() {
  const { appRole, loading, user } = useAuth();
  const [event, setEvent] = useState<EventDto | null>(null);
  const [pendingPayments, setPendingPayments] = useState<PaymentAttempt[]>([]);
  const [inventory, setInventory] = useState<ShirtInventoryItem[]>([]);
  const [slides, setSlides] = useState<SlideshowImage[]>([]);
  const [statusFilter, setStatusFilter] = useState("PENDING_ADMIN_VERIFICATION");
  const [methodFilter, setMethodFilter] = useState<"PAYNOW" | "BANK_TRANSFER" | "">("");
  const [adminTransactionIds, setAdminTransactionIds] = useState<Record<number, string>>({});
  const [rejectionReasons, setRejectionReasons] = useState<Record<number, string>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAdmin = useCallback(async () => {
    const current = await getCurrentEvent();
    setEvent(current);
    const [payments, inventoryItems, configuredSlides] = await Promise.all([
      getPaymentAttempts({ status: statusFilter, method: methodFilter, eventId: current.id }),
      getInventory(current.id),
      getSlideshow(current.id),
    ]);
    setPendingPayments(payments);
    setInventory(inventoryItems);
    setSlides(configuredSlides.length ? configuredSlides : [{ imageUrl: "", blurb: "", displayOrder: 1, active: true }]);
  }, [methodFilter, statusFilter]);

  useEffect(() => {
    if (loading || !user || appRole !== "admin") return;
    loadAdmin().catch(() => setError("Start the backend to use admin tools."));
  }, [appRole, loadAdmin, loading, user]);

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
      await confirmPayment(paymentAttemptId, adminTransactionIds[paymentAttemptId] || `ADMIN-${paymentAttemptId}`);
      setMessage("Payment confirmed and inventory updated.");
      await loadAdmin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm payment.");
    }
  }

  async function handleReject(paymentAttemptId: number) {
    setError("");
    const reason = rejectionReasons[paymentAttemptId]?.trim();
    if (!reason) {
      setError("Please enter a rejection reason before rejecting payment.");
      return;
    }
    try {
      await rejectPayment(paymentAttemptId, reason);
      setMessage("Payment rejected. Inventory was not reduced.");
      await loadAdmin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reject payment.");
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
      {!loading && (!user || appRole !== "admin") ? (
        <Alert severity="warning">
          Sign in with an admin account to use payment verification, exports, inventory, and slideshow tools.
        </Alert>
      ) : null}
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
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <MenuItem value="PENDING_ADMIN_VERIFICATION">Pending verification</MenuItem>
                    <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                    <MenuItem value="PAYMENT_REJECTED">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Method</InputLabel>
                  <Select label="Method" value={methodFilter} onChange={(e) => setMethodFilter(e.target.value as "PAYNOW" | "BANK_TRANSFER" | "")}>
                    <MenuItem value="">All methods</MenuItem>
                    <MenuItem value="PAYNOW">PayNow</MenuItem>
                    <MenuItem value="BANK_TRANSFER">Bank transfer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {pendingPayments.map((payment) => (
                <Box key={payment.id} sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
                    <Box>
                      <Typography fontWeight={800}>Registration #{payment.registrationId}</Typography>
                      <Typography color="text.secondary">
                        {payment.payerName ?? "Participant"} · {payment.payerEmail ?? "email unavailable"} · {formatMoney(payment.totalAmount)}
                      </Typography>
                    </Box>
                    <Chip label={payment.verificationStatus.replaceAll("_", " ")} color={payment.verificationStatus === "CONFIRMED" ? "success" : payment.verificationStatus === "PAYMENT_REJECTED" ? "error" : "warning"} />
                  </Stack>
                  <Typography color="text.secondary">
                    {payment.method} · user ref {payment.userTransactionId} · generated ref {payment.generatedReference}
                  </Typography>
                  {payment.proofFileUrl ? (
                    <Typography sx={{ mt: 1 }}>
                      Proof:{" "}
                      <Box component="a" href={payment.proofFileUrl} target="_blank" rel="noreferrer" sx={{ color: "primary.main", fontWeight: 700 }}>
                        {payment.proofFileUrl}
                      </Box>
                    </Typography>
                  ) : null}
                  {payment.rejectionReason ? <Alert severity="error" sx={{ mt: 1 }}>{payment.rejectionReason}</Alert> : null}
                  {payment.verificationStatus === "PENDING_ADMIN_VERIFICATION" ? (
                    <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Admin transaction ID / bank reference"
                          value={adminTransactionIds[payment.id] ?? ""}
                          onChange={(e) => setAdminTransactionIds((current) => ({ ...current, [payment.id]: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Rejection reason"
                          value={rejectionReasons[payment.id] ?? ""}
                          onChange={(e) => setRejectionReasons((current) => ({ ...current, [payment.id]: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                          <Button variant="contained" onClick={() => handleConfirm(payment.id)}>
                            Confirm payment
                          </Button>
                          <Button color="error" variant="outlined" onClick={() => handleReject(payment.id)}>
                            Reject payment
                          </Button>
                        </Stack>
                      </Grid>
                    </Grid>
                  ) : null}
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
      {event ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5">Exports</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Download operational CSVs for committee reporting and launch reconciliation.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
            <Button component="a" href={exportCsvUrl(event.id, "registrations")} target="_blank" rel="noreferrer" variant="outlined">
              Registrations CSV
            </Button>
            <Button component="a" href={exportCsvUrl(event.id, "finance")} target="_blank" rel="noreferrer" variant="outlined">
              Finance CSV
            </Button>
            <Button component="a" href={exportCsvUrl(event.id, "corporate-orders")} target="_blank" rel="noreferrer" variant="outlined">
              Corporate CSV
            </Button>
            <Button component="a" href={exportCsvUrl(event.id, "inventory")} target="_blank" rel="noreferrer" variant="outlined">
              Inventory CSV
            </Button>
          </Stack>
        </Paper>
      ) : null}
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
