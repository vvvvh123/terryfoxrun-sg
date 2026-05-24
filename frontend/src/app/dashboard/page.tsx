"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, Box, Button, Chip, Dialog, DialogContent, DialogTitle, Divider, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import { QRCodeSVG } from "qrcode.react";
import { Announcement, EventDto, RegistrationDetail, getAnnouncements, getEvent, getMyRegistrations, getRegistration } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(cents / 100);
}

function eventTitle(registration: RegistrationDetail) {
  return registration.eventYear ? `${registration.eventName} ${registration.eventYear}` : registration.eventName;
}

function shirtSummary(participant: RegistrationDetail["participants"][number]) {
  const orders = participant.shirtOrders?.filter((shirt) => shirt.quantity > 0) ?? [];
  if (orders.length) {
    return orders.map((shirt) => `${shirt.quantity} x ${shirt.size}`).join(", ");
  }
  return participant.tshirtQty ? `${participant.tshirtQty} x ${participant.tshirtSize}` : "No shirt selected";
}

function paymentState(registration: RegistrationDetail) {
  if (registration.paymentStatus === "CONFIRMED") {
    return {
      color: "success" as const,
      title: "Payment confirmed",
      nextStep: "Your pickup code is available. Bring the code or QR display when collecting shirts.",
    };
  }
  if (registration.paymentStatus === "PAYMENT_REJECTED") {
    const reason = registration.paymentAttempts.find((attempt) => attempt.rejectionReason)?.rejectionReason;
    return {
      color: "error" as const,
      title: "Payment needs attention",
      nextStep: reason ? `Admin note: ${reason}` : "Please check your payment reference or contact the Terry Fox Run team.",
    };
  }
  return {
    color: "warning" as const,
    title: "Waiting for payment confirmation",
    nextStep: "The admin team will verify the PayNow or bank-transfer record before pickup codes are released.",
  };
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const { loading, user } = useAuth();
  const [registrations, setRegistrations] = useState<RegistrationDetail[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [eventDetails, setEventDetails] = useState<Record<number, EventDto>>({});
  const [receipt, setReceipt] = useState<RegistrationDetail | null>(null);
  const [pickupInfo, setPickupInfo] = useState<RegistrationDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setRegistrations([]);
      return;
    }
    const id = searchParams.get("registrationId") ?? window.localStorage.getItem("lastRegistrationId");
    const load = id ? getRegistration(Number(id)).then((registration) => [registration]) : getMyRegistrations();
    load
      .then(async (loaded) => {
        setRegistrations(loaded);
        const uniqueEventIds = Array.from(new Set(loaded.map((registration) => registration.eventId)));
        const eventEntries = await Promise.all(uniqueEventIds.map(async (eventId) => [eventId, await getEvent(eventId)] as const));
        setEventDetails(Object.fromEntries(eventEntries));
        setAnnouncements((await Promise.all(uniqueEventIds.map((eventId) => getAnnouncements(eventId, true)))).flat());
      })
      .catch(() => setError("No registration is available yet. Complete a registration first, or try again later."));
  }, [loading, searchParams, user]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">My Events</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Participant dashboard for payment status, event reminders, receipts, and pickup code access.
        </Typography>
      </Box>
      {!loading && !user ? (
        <Alert
          severity="info"
          action={
            <Button href="/login" color="inherit" size="small">
              Sign in
            </Button>
          }
        >
          Sign in to view your registrations, receipts, and pickup codes.
        </Alert>
      ) : null}
      {error ? <Alert severity="info">{error}</Alert> : null}
      {announcements.length ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5">Announcements</Typography>
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {announcements.map((announcement) => (
              <Alert key={announcement.id} severity="info">
                <strong>{announcement.title}</strong>
                <Typography sx={{ whiteSpace: "pre-line" }}>{announcement.body}</Typography>
              </Alert>
            ))}
          </Stack>
        </Paper>
      ) : null}
      <Grid container spacing={2}>
        {(registrations.length ? registrations : []).map((registration) => (
          <Grid item xs={12} key={registration.id}>
            <Paper sx={{ p: 3 }}>
              {(() => {
                const state = paymentState(registration);
                return (
                  <Alert severity={state.color} sx={{ mb: 2 }}>
                    <strong>{state.title}.</strong> {state.nextStep}
                  </Alert>
                );
              })()}
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                <Box>
                  <Typography variant="h5">{eventTitle(registration)}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                    {registration.status === "CONFIRMED" && registration.paymentStatus === "CONFIRMED" ? (
                      <Chip label="Confirmed" color="success" />
                    ) : (
                      <>
                        <Chip label={`Registration: ${registration.status.replaceAll("_", " ").toLowerCase()}`} color={registration.status === "CONFIRMED" ? "success" : "warning"} />
                        <Chip label={`Payment: ${registration.paymentStatus.replaceAll("_", " ").toLowerCase()}`} variant="outlined" />
                      </>
                    )}
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
                      {registration.paymentStatus === "CONFIRMED" && participant.pickupCode ? (
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }} alignItems={{ sm: "center" }}>
                          <Box sx={{ p: 1, bgcolor: "white", border: "1px solid #e2e6ef", borderRadius: 1, width: 116 }}>
                            <QRCodeSVG value={participant.pickupCode} size={96} />
                          </Box>
                          <Box>
                            <Typography>Pickup code</Typography>
                            <Typography variant="h6">{participant.pickupCode}</Typography>
                          </Box>
                        </Stack>
                      ) : (
                        <Typography sx={{ mt: 2 }}>
                          Pickup code: <strong>Released after confirmation</strong>
                        </Typography>
                      )}
                      <Typography color="text.secondary">
                        T-shirt: {shirtSummary(participant)}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
                <Button variant="outlined" onClick={() => setReceipt(registration)}>Receipt</Button>
                <Button variant="outlined" onClick={() => setPickupInfo(registration)}>Pickup instructions</Button>
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
      <Dialog open={Boolean(receipt)} onClose={() => setReceipt(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Receipt</DialogTitle>
        <DialogContent>
          {receipt ? (
            <Stack spacing={2}>
              <Typography variant="h5">{eventTitle(receipt)}</Typography>
              <Divider />
              <Typography>Payer: <strong>{receipt.payerName}</strong></Typography>
              <Typography>Email: {receipt.payerEmail}</Typography>
              <Typography>Reference: {receipt.generatedPaymentReference}</Typography>
              <Typography>Status: {receipt.paymentStatus}</Typography>
              <Typography variant="h5">Total: {formatMoney(receipt.totalAmount)}</Typography>
              <Button variant="contained" onClick={() => window.print()}>Print receipt</Button>
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(pickupInfo)} onClose={() => setPickupInfo(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Pickup instructions</DialogTitle>
        <DialogContent>
          {pickupInfo ? (
            <Stack spacing={1.5}>
              <Typography variant="h6">{eventDetails[pickupInfo.eventId]?.locationPickup ?? "Pickup venue to be confirmed"}</Typography>
              <Typography color="text.secondary">
                {eventDetails[pickupInfo.eventId]?.pickupStart ? new Date(eventDetails[pickupInfo.eventId].pickupStart as string).toLocaleString("en-SG") : "Pickup date to be confirmed"}
              </Typography>
              <Typography sx={{ whiteSpace: "pre-line" }}>
                {eventDetails[pickupInfo.eventId]?.eventDetails?.pickupDisclaimer ?? "Bring your pickup code or QR display when collecting T-shirts."}
              </Typography>
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>
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
