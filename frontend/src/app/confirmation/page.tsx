"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { RegistrationDetail, getRegistration } from "@/lib/api";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(cents / 100);
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const [registration, setRegistration] = useState<RegistrationDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = searchParams.get("registrationId") ?? window.localStorage.getItem("lastRegistrationId");
    if (!id) {
      setError("No registration selected. Complete checkout first.");
      return;
    }
    getRegistration(Number(id))
      .then(setRegistration)
      .catch(() => setError("Could not load the registration confirmation. Please start the backend and try again."));
  }, [searchParams]);

  const latestPayment = useMemo(() => registration?.paymentAttempts[0], [registration]);
  const methodLabel = latestPayment?.method === "BANK_TRANSFER" ? "bank transfer" : "PayNow";
  const eventYear = registration?.eventName.match(/\b(20\d{2})\b/)?.[1] ?? new Date().getFullYear();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">Thank you for supporting the Terry Fox Run SG {eventYear}!!</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          See you at the run! Transaction is pending manual verification.
        </Typography>
      </Box>
      {error ? <Alert severity="warning">{error}</Alert> : null}
      {registration ? (
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h5">{registration.eventName}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                    <Chip label={registration.paymentStatus.replaceAll("_", " ")} color="warning" />
                    <Chip label={registration.generatedPaymentReference} variant="outlined" />
                  </Stack>
                </Box>
                <Box sx={{ p: 2, bgcolor: "#f6f7fb", borderRadius: 2 }}>
                  <Typography color="text.secondary">Amount payable</Typography>
                  <Typography variant="h4">{formatMoney(registration.totalAmount)}</Typography>
                </Box>
                <Typography>
                  Please keep <strong>{registration.generatedPaymentReference}</strong> in your {methodLabel} comments so the admin team can match the payment quickly.
                </Typography>
                <Typography color="text.secondary">
                  A pending-payment email preview is generated locally now. After the admin team verifies payment, the registration changes to confirmed and pickup codes appear in My Events.
                </Typography>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Typography variant="h5">What happens next</Typography>
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                <Typography>1. Admin checks the PayNow or bank-transfer record.</Typography>
                <Typography>2. Admin records the final transaction ID.</Typography>
                <Typography>3. You receive confirmation and can view pickup codes in My Events.</Typography>
              </Stack>
              <Button component={Link} href={`/dashboard?registrationId=${registration.id}`} fullWidth variant="contained" sx={{ mt: 3 }}>
                View My Events
              </Button>
              <Button component={Link} href="/event" fullWidth sx={{ mt: 1 }}>
                Back to event details
              </Button>
            </Paper>
          </Grid>
        </Grid>
      ) : null}
    </Stack>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<Typography>Loading confirmation...</Typography>}>
      <ConfirmationContent />
    </Suspense>
  );
}
