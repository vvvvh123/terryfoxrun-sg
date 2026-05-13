"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import { RegistrationDetail, getMyRegistrations, getRegistration } from "@/lib/api";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(cents / 100);
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const [registrations, setRegistrations] = useState<RegistrationDetail[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = searchParams.get("registrationId") ?? window.localStorage.getItem("lastRegistrationId");
    const load = id ? getRegistration(Number(id)).then((registration) => [registration]) : getMyRegistrations();
    load.then(setRegistrations).catch(() => setError("No registration loaded yet. Complete a registration first, or start the backend."));
  }, [searchParams]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">My Events</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Participant dashboard for payment status, event reminders, receipts, and pickup code access.
        </Typography>
      </Box>
      {error ? <Alert severity="info">{error}</Alert> : null}
      <Grid container spacing={2}>
        {(registrations.length ? registrations : []).map((registration) => (
          <Grid item xs={12} key={registration.id}>
            <Paper sx={{ p: 3 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                <Box>
                  <Typography variant="h5">{registration.eventName}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                    <Chip label={registration.status} color={registration.status === "CONFIRMED" ? "success" : "warning"} />
                    <Chip label={registration.paymentStatus} variant="outlined" />
                    <Chip label={registration.generatedPaymentReference} variant="outlined" />
                  </Stack>
                </Box>
                <Box sx={{ minWidth: 160 }}>
                  <Typography color="text.secondary">Total paid / payable</Typography>
                  <Typography variant="h4">{formatMoney(registration.totalAmount)}</Typography>
                </Box>
              </Stack>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {registration.participants.map((participant) => (
                  <Grid item xs={12} md={6} key={participant.id}>
                    <Box sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2, minHeight: 156 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <QrCode2Icon color="primary" />
                        <Box>
                          <Typography fontWeight={800}>{participant.name}</Typography>
                          <Typography color="text.secondary">{participant.categoryName ?? "Participant"}</Typography>
                        </Box>
                      </Stack>
                      <Typography sx={{ mt: 2 }}>
                        Pickup code: <strong>{registration.paymentStatus === "CONFIRMED" ? participant.pickupCode : "Available after confirmation"}</strong>
                      </Typography>
                      <Typography color="text.secondary">
                        T-shirt: {participant.tshirtQty ? `${participant.tshirtQty} x ${participant.tshirtSize}` : "No shirt selected"}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
                <Button variant="outlined">Receipt preview</Button>
                <Button variant="outlined">Pickup instructions</Button>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
      {!registrations.length && !error ? (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5">No registrations yet</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Your upcoming event registrations will appear here after checkout.
          </Typography>
        </Paper>
      ) : null}
    </Stack>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Typography>Loading dashboard...</Typography>}>
      <DashboardContent />
    </Suspense>
  );
}
