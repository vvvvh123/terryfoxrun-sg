"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Chip, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { EventDto, PickupResult, collectPickup, getCurrentEvent, getPickupHistory, lookupPickup } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

function resultSeverity(result?: string) {
  if (result === "COLLECTED") return "success" as const;
  if (result === "ALREADY_COLLECTED") return "warning" as const;
  if (result === "READY_FOR_PICKUP") return "info" as const;
  if (result === "PAYMENT_NOT_CONFIRMED") return "error" as const;
  return "info" as const;
}

function shirtSummary(result: PickupResult) {
  const orders = result.shirtOrders?.filter((shirt) => shirt.quantity > 0) ?? [];
  if (orders.length) return orders.map((shirt) => `${shirt.quantity} x ${shirt.size}`).join(", ");
  return result.tshirtQty ? `${result.tshirtQty} x ${result.tshirtSize} (${result.tshirtType})` : "No shirt selected";
}

export default function VolunteerPage() {
  const { appRole, loading, user } = useAuth();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<PickupResult | null>(null);
  const [event, setEvent] = useState<EventDto | null>(null);
  const [history, setHistory] = useState<PickupResult[]>([]);
  const [historySearch, setHistorySearch] = useState("");
  const [tab, setTab] = useState(0);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);

  const allowed = appRole === "admin" || appRole === "volunteer";

  useEffect(() => {
    getCurrentEvent()
      .then(async (current) => {
        setEvent(current);
        setHistory(await getPickupHistory({ eventId: current.id }));
      })
      .catch(() => undefined);
    return () => {
      scannerRef.current?.stop().catch(() => undefined);
      scannerRef.current?.clear();
    };
  }, []);

  async function refreshHistory(query = historySearch) {
    if (!event) return;
    setHistory(await getPickupHistory({ eventId: event.id, query }));
  }

  async function handleLookup(value = code) {
    const token = value.trim();
    if (!token) {
      setError("Enter or scan a pickup code.");
      return;
    }
    setError("");
    setResult(null);
    try {
      setResult(await lookupPickup(token));
    } catch (err) {
      setError(err instanceof Error && err.message.includes("404") ? "Pickup code not found." : err instanceof Error ? err.message : "Pickup lookup failed.");
    }
  }

  async function handleCollect() {
    if (!result?.pickupCode) return;
    setError("");
    try {
      const collected = await collectPickup(result.pickupCode);
      setResult(collected);
      setCode("");
      await refreshHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pickup collection failed.");
    }
  }

  async function startCameraScanner() {
    setError("");
    setScanning(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("pickup-qr-reader");
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: 240, height: 240 } },
        async (decodedText: string) => {
          await scanner.stop().catch(() => undefined);
          scanner.clear();
          scannerRef.current = null;
          setScanning(false);
          await handleLookup(decodedText);
        },
        () => undefined,
      );
    } catch (err) {
      setScanning(false);
      setError(err instanceof Error ? err.message : "Could not start camera scanner.");
    }
  }

  async function stopCameraScanner() {
    await scannerRef.current?.stop().catch(() => undefined);
    scannerRef.current?.clear();
    scannerRef.current = null;
    setScanning(false);
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">Volunteer Pickup</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Scan a pickup QR code or enter a manual code to mark T-shirts as collected.
        </Typography>
      </Box>
      {!loading && (!user || !allowed) ? (
        <Alert severity="warning">Sign in with a volunteer or admin account to use the pickup portal.</Alert>
      ) : null}
      {error ? <Alert severity="warning">{error}</Alert> : null}
      <Tabs value={tab} onChange={(_, value) => setTab(value)}>
        <Tab label="Check pickup" />
        <Tab label="History" />
      </Tabs>
      {tab === 0 ? (
        <>
      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5">Manual code entry</Typography>
            <TextField
              fullWidth
              label="Pickup code"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              sx={{ mt: 2 }}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleLookup();
              }}
            />
            <Button fullWidth variant="contained" size="large" sx={{ mt: 2 }} disabled={!allowed} onClick={() => handleLookup()}>
              Check pickup
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ sm: "center" }}>
              <Box>
                <Typography variant="h5">QR scanner</Typography>
                <Typography color="text.secondary">Use the device camera for faster pickup queues.</Typography>
              </Box>
              {scanning ? (
                <Button variant="outlined" color="error" onClick={stopCameraScanner}>
                  Stop scanner
                </Button>
              ) : (
                <Button variant="outlined" startIcon={<QrCodeScannerIcon />} disabled={!allowed} onClick={startCameraScanner}>
                  Start scanner
                </Button>
              )}
            </Stack>
            <Box id="pickup-qr-reader" sx={{ mt: 2, minHeight: 260, border: "1px dashed #cfd6e4", borderRadius: 2, overflow: "hidden" }} />
          </Paper>
        </Grid>
      </Grid>
      {result ? (
        <Paper sx={{ p: 3 }}>
          <Alert severity={resultSeverity(result.result)} sx={{ mb: 2 }}>
            <strong>{result.result.replaceAll("_", " ")}.</strong> {result.message}
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography color="text.secondary">Participant</Typography>
              <Typography variant="h5">{result.participantName}</Typography>
              <Typography>{result.categoryName ?? "Participant category"}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography color="text.secondary">Registration</Typography>
              <Typography fontWeight={800}>#{result.registrationId} · {result.payerName}</Typography>
              <Chip sx={{ mt: 1 }} label={result.paymentStatus} color={result.paymentStatus === "CONFIRMED" ? "success" : "warning"} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography color="text.secondary">T-shirt</Typography>
              <Typography fontWeight={800}>{shirtSummary(result)}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography color="text.secondary">Pickup code</Typography>
              <Typography fontWeight={800}>{result.pickupCode}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography color="text.secondary">Pickup status</Typography>
              <Typography fontWeight={800}>{result.pickupStatus}</Typography>
              {result.pickupTimestamp ? <Typography color="text.secondary">{new Date(result.pickupTimestamp).toLocaleString("en-SG")}</Typography> : null}
            </Grid>
          </Grid>
          {result.result === "READY_FOR_PICKUP" ? (
            <Button variant="contained" size="large" sx={{ mt: 3 }} disabled={!allowed} onClick={handleCollect}>
              Mark collected
            </Button>
          ) : null}
        </Paper>
      ) : null}
        </>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <TextField
              label="Search pickup code or participant"
              value={historySearch}
              onChange={async (event) => {
                const next = event.target.value;
                setHistorySearch(next);
                if (event) await refreshHistory(next);
              }}
            />
            <Stack spacing={1.5}>
              {history.map((item) => (
                <Box key={item.participantId} sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
                    <Typography fontWeight={800}>{item.participantName}</Typography>
                    <Chip size="small" label={item.result.replaceAll("_", " ")} color={resultSeverity(item.result)} />
                  </Stack>
                  <Typography color="text.secondary">
                    {item.pickupCode} · {shirtSummary(item)} · {item.pickupTimestamp ? new Date(item.pickupTimestamp).toLocaleString("en-SG") : "Not collected yet"}
                  </Typography>
                </Box>
              ))}
              {!history.length ? <Typography color="text.secondary">No pickup history matches this search.</Typography> : null}
            </Stack>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
