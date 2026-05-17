"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip as MuiTooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import {
  CategoryDto,
  DailyInventorySold,
  EventDto,
  FormFieldConfig,
  PaymentAttempt,
  ShirtInventoryItem,
  SlideshowImage,
  confirmPayment,
  copyEvent,
  createEvent,
  deleteEvent,
  exportCsvUrl,
  getCategories,
  getCurrentEvent,
  getDailySold,
  getEvents,
  getFormFields,
  getInventory,
  getPaymentAttempts,
  getSlideshow,
  rejectPayment,
  saveFormFields,
  saveSlideshow,
  setCurrentEvent,
  updateEvent,
  updateInventory,
} from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { defaultFormFields } from "@/lib/registrationFields";

function formatMoney(cents?: number) {
  return new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format((cents ?? 0) / 100);
}

function toDateTimeInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function fromDateTimeInput(value: string) {
  return value ? new Date(value).toISOString() : undefined;
}

export default function AdminPage() {
  const { appRole, loading, user } = useAuth();
  const [tab, setTab] = useState(0);
  const [events, setEvents] = useState<EventDto[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [event, setEvent] = useState<EventDto | null>(null);
  const [eventDraft, setEventDraft] = useState<EventDto | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [payments, setPayments] = useState<PaymentAttempt[]>([]);
  const [inventory, setInventory] = useState<ShirtInventoryItem[]>([]);
  const [soldDaily, setSoldDaily] = useState<DailyInventorySold[]>([]);
  const [soldSize, setSoldSize] = useState("ALL");
  const [slides, setSlides] = useState<SlideshowImage[]>([]);
  const [formFields, setFormFields] = useState<FormFieldConfig[]>(defaultFormFields);
  const [statusFilter, setStatusFilter] = useState("PENDING_ADMIN_VERIFICATION");
  const [methodFilter, setMethodFilter] = useState<"PAYNOW" | "BANK_TRANSFER" | "">("");
  const [adminTransactionIds, setAdminTransactionIds] = useState<Record<number, string>>({});
  const [rejectionReasons, setRejectionReasons] = useState<Record<number, string>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadEventData = useCallback(async (targetEvent: EventDto) => {
    setEvent(targetEvent);
    setEventDraft(targetEvent);
    const [loadedPayments, inventoryItems, configuredSlides, loadedFields, loadedCategories] = await Promise.all([
      getPaymentAttempts({ status: statusFilter, method: methodFilter, eventId: targetEvent.id }),
      getInventory(targetEvent.id),
      getSlideshow(targetEvent.id),
      getFormFields(targetEvent.id),
      getCategories(targetEvent.id),
    ]);
    setPayments(loadedPayments);
    setInventory(inventoryItems);
    setSlides(configuredSlides.length ? configuredSlides : [{ imageUrl: "", blurb: "", displayOrder: 1, active: true }]);
    setFormFields(loadedFields.length ? loadedFields : defaultFormFields);
    setCategories(loadedCategories);
    setSoldDaily(await getDailySold(targetEvent.id, soldSize));
  }, [methodFilter, soldSize, statusFilter]);

  const loadAdmin = useCallback(async (preferredEventId?: number | null) => {
    const loadedEvents = await getEvents();
    setEvents(loadedEvents);
    if (!loadedEvents.length) {
      setSelectedEventId(null);
      setEvent(null);
      setEventDraft(null);
      setPayments([]);
      setInventory([]);
      setSoldDaily([]);
      setSlides([]);
      setFormFields(defaultFormFields);
      setCategories([]);
      return;
    }
    const target = loadedEvents.find((candidate) => candidate.id === preferredEventId)
      ?? loadedEvents.find((candidate) => candidate.isCurrent)
      ?? await getCurrentEvent();
    setSelectedEventId(target.id);
    await loadEventData(target);
  }, [loadEventData]);

  const selectEvent = useCallback(async (target: EventDto) => {
    setSelectedEventId(target.id);
    await loadEventData(target);
  }, [loadEventData]);

  useEffect(() => {
    if (loading || !user || appRole !== "admin") return;
    loadAdmin(selectedEventId).catch(() => setError("Start the backend to use admin tools."));
  }, [appRole, loadAdmin, loading, selectedEventId, user]);

  const metrics = useMemo(() => {
    const remaining = inventory.reduce((sum, item) => sum + Number(item.quantityAvailable || 0), 0);
    const confirmed = payments.filter((payment) => payment.verificationStatus === "CONFIRMED").length;
    return [
      { label: "Pending payments", value: payments.filter((payment) => payment.verificationStatus === "PENDING_ADMIN_VERIFICATION").length, help: "Payment attempts waiting for manual admin verification." },
      { label: "Confirmed in view", value: confirmed, help: "Confirmed payments matching the current payment filters." },
      { label: "Stock remaining", value: remaining, help: "Total available T-shirt stock for the selected event." },
      { label: "Active slides", value: slides.filter((slide) => slide.active).length, help: "Slideshow images currently enabled for the selected event homepage." },
    ];
  }, [inventory, payments, slides]);

  function patchEvent(patch: Partial<EventDto>) {
    setEventDraft((current) => (current ? { ...current, ...patch } : current));
  }

  function patchPaymentInstructions(patch: NonNullable<EventDto["paymentInstructions"]>) {
    setEventDraft((current) =>
      current
        ? {
            ...current,
            paymentInstructions: { ...(current.paymentInstructions ?? {}), ...patch },
          }
        : current,
    );
  }

  function patchEventDetails(patch: NonNullable<EventDto["eventDetails"]>) {
    setEventDraft((current) =>
      current
        ? {
            ...current,
            eventDetails: { ...(current.eventDetails ?? {}), ...patch },
          }
        : current,
    );
  }

  function patchSocialLinks(patch: NonNullable<EventDto["socialLinks"]>) {
    setEventDraft((current) =>
      current
        ? {
            ...current,
            socialLinks: { ...(current.socialLinks ?? {}), ...patch },
          }
        : current,
    );
  }

  function updateFaq(index: number, patch: Partial<NonNullable<EventDto["faqs"]>[number]>) {
    setEventDraft((current) => {
      if (!current) return current;
      const faqs = [...(current.faqs ?? [])];
      faqs[index] = { ...faqs[index], ...patch };
      return { ...current, faqs };
    });
  }

  function removeFaq(index: number) {
    setEventDraft((current) => (current ? { ...current, faqs: (current.faqs ?? []).filter((_, currentIndex) => currentIndex !== index) } : current));
  }

  function removeSlide(index: number) {
    setSlides((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function removeField(index: number) {
    setFormFields((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  async function handleCreateEvent() {
    const year = new Date().getFullYear() + 1;
    const source = event;
    const request: EventDto = {
      id: 0,
      name: "New Terry Fox Run SG",
      year,
      isCurrent: false,
      status: "draft",
      donationPresets: [25_00, 50_00, 100_00],
      shirtPrice: source?.shirtPrice ?? 35_00,
      shirtSizes: source?.shirtSizes ?? [],
      paymentInstructions: source?.paymentInstructions,
      eventDetails: {
        scheduleSummary: "Schedule to be confirmed.",
        routeNotes: "Route details to be confirmed.",
        pickupDisclaimer: "Pickup details to be confirmed.",
        donationNote: "All net proceeds support cancer research in Singapore.",
      },
      faqs: [],
      contactRecipientEmail: source?.contactRecipientEmail ?? "corporate@terryfoxrun.global",
      socialLinks: source?.socialLinks ?? {
        instagramUrl: "https://instagram.com/terryfoxrunsingapore/",
        instagramLogoUrl: "/ig_logo.jpg",
        facebookUrl: "https://www.facebook.com/Terry-Fox-Run-Singapore-509827395766103/",
        facebookLogoUrl: "/fb_logo.jpg",
      },
    };
    setError("");
    try {
      const created = await createEvent(request);
      setMessage("Draft event created.");
      await loadAdmin(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create event.");
    }
  }

  async function handleCopyEvent(sourceId: number) {
    setError("");
    try {
      const copied = await copyEvent(sourceId);
      setMessage("Event copied. Review dates, copy, and inventory before making it current.");
      await loadAdmin(copied.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not copy event.");
    }
  }

  async function handleSetCurrent(sourceId: number) {
    setError("");
    try {
      const selected = await setCurrentEvent(sourceId);
      setMessage("Current event updated.");
      await loadAdmin(selected.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not set current event.");
    }
  }

  async function handleDeleteEvent(candidate: EventDto) {
    const confirmed = window.confirm(`Are you sure you wish to delete ${candidate.name}, ${candidate.year}?`);
    if (!confirmed) return;
    setError("");
    try {
      await deleteEvent(candidate.id);
      setMessage(`${candidate.name}, ${candidate.year} deleted.`);
      await loadAdmin(candidate.id === selectedEventId ? null : selectedEventId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete event.");
    }
  }

  async function handleSaveEvent() {
    if (!eventDraft) return;
    setError("");
    try {
      const saved = await updateEvent(eventDraft.id, eventDraft);
      setEvent(saved);
      setEventDraft(saved);
      setMessage("Event configuration saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save event configuration.");
    }
  }

  async function handleSaveInventory() {
    if (!event) return;
    setError("");
    try {
      await updateInventory(event.id, inventory);
      setMessage("Inventory saved.");
      await loadAdmin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save inventory.");
    }
  }

  async function handleSaveFormFields() {
    if (!event) return;
    setError("");
    try {
      await saveFormFields(
        event.id,
        formFields.map((field, index) => ({ ...field, displayOrder: index + 1 })),
      );
      setMessage("Registration field configuration saved.");
      await loadAdmin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save registration fields.");
    }
  }

  async function handleSaveSlides() {
    if (!event) return;
    setError("");
    try {
      await saveSlideshow(
        event.id,
        slides.map((slide, index) => ({ ...slide, displayOrder: index + 1 })),
      );
      setMessage("Homepage slideshow saved.");
      await loadAdmin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save slideshow.");
    }
  }

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

  function updateField(index: number, patch: Partial<FormFieldConfig>) {
    setFormFields((current) => current.map((field, currentIndex) => (currentIndex === index ? { ...field, ...patch } : field)));
  }

  function updateInventoryItem(index: number, patch: Partial<ShirtInventoryItem>) {
    setInventory((current) => current.map((item, currentIndex) => (currentIndex === index ? { ...item, ...patch } : item)));
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">Admin Portal</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Configure the current event, registration rules, payment instructions, inventory, homepage slideshow, exports, and manual payment verification.
        </Typography>
      </Box>
      {!loading && (!user || appRole !== "admin") ? (
        <Alert severity="warning">
          Sign in with an admin account to use payment verification, exports, inventory, and configuration tools.
        </Alert>
      ) : null}
      {error ? <Alert severity="warning">{error}</Alert> : null}
      {message ? <Alert severity="success">{message}</Alert> : null}

      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ md: "center" }}>
          <Box>
            <Typography variant="h5">Event hub</Typography>
            <Typography color="text.secondary">
              Choose an event to manage, copy last year&apos;s setup, or create a fresh draft.
            </Typography>
          </Box>
          <Button variant="contained" onClick={handleCreateEvent}>
            Create event
          </Button>
        </Stack>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {events.map((candidate) => (
            <Grid item xs={12} md={4} key={candidate.id}>
              <Box
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: candidate.id === selectedEventId ? "primary.main" : "#e2e6ef",
                  borderRadius: 2,
                  bgcolor: candidate.id === selectedEventId ? "#fff7f8" : "white",
                }}
              >
                <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap", rowGap: 1 }}>
                  {candidate.isCurrent ? <Chip size="small" color="success" label="Current" /> : null}
                  <Chip size="small" label={candidate.status || "draft"} />
                </Stack>
                <Typography fontWeight={800}>{candidate.name}, {candidate.year}</Typography>
                <Typography color="text.secondary">{candidate.locationEvent || "Venue to be confirmed"}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button size="small" variant={candidate.id === selectedEventId ? "contained" : "outlined"} onClick={() => selectEvent(candidate)}>
                    Manage
                  </Button>
                  {!candidate.isCurrent ? (
                    <Button size="small" onClick={() => handleSetCurrent(candidate.id)}>
                      Make current
                    </Button>
                  ) : null}
                  <Button size="small" onClick={() => handleCopyEvent(candidate.id)}>
                    Copy
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDeleteEvent(candidate)}>
                    Delete
                  </Button>
                </Stack>
              </Box>
            </Grid>
          ))}
          {!events.length ? (
            <Grid item xs={12}>
              <Alert severity="info">No events loaded yet. Start the backend or create the first event.</Alert>
            </Grid>
          ) : null}
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        {metrics.map((metric) => (
          <Grid item xs={12} md={3} key={metric.label}>
            <Paper sx={{ p: 3 }}>
              <MuiTooltip title={metric.help}>
                <Typography color="text.secondary" sx={{ display: "inline-flex", cursor: "help" }}>{metric.label}</Typography>
              </MuiTooltip>
              <Typography variant="h3">{metric.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" allowScrollButtonsMobile sx={{ borderBottom: "1px solid #e2e6ef", mb: 3 }}>
          <Tab label="Payments" />
          <Tab label="Event Setup" />
          <Tab label="Registration Fields" />
          <Tab label="Inventory" />
          <Tab label="Homepage Slideshow" />
          <Tab label="Exports" />
        </Tabs>

        {tab === 0 ? (
          <Stack spacing={2}>
            <Typography variant="h5">Payment verification queue</Typography>
            <Grid container spacing={2}>
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
            <Stack spacing={1.5}>
              {payments.map((payment) => (
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
                    {payment.method} · payment comment {payment.userTransactionId} · generated ref {payment.generatedReference}
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
              {!payments.length ? <Typography color="text.secondary">No payments match the current filters.</Typography> : null}
            </Stack>
          </Stack>
        ) : null}

        {tab === 1 && eventDraft ? (
          <Stack spacing={3}>
            <Typography variant="h5">Current event setup</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Event name" value={eventDraft.name} onChange={(e) => patchEvent({ name: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth type="number" label="Year" value={eventDraft.year} onChange={(e) => patchEvent({ year: Number(e.target.value) })} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth label="Status" value={eventDraft.status} onChange={(e) => patchEvent({ status: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="T-shirt price (SGD)"
                  value={((eventDraft.shirtPrice ?? 0) / 100).toString()}
                  inputProps={{ min: 0, step: "0.01" }}
                  helperText="Used for individual registration checkout totals."
                  onChange={(e) => patchEvent({ shirtPrice: Math.round(Number(e.target.value || 0) * 100) })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Event venue" value={eventDraft.locationEvent ?? ""} onChange={(e) => patchEvent({ locationEvent: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Pickup venue" value={eventDraft.locationPickup ?? ""} onChange={(e) => patchEvent({ locationPickup: e.target.value })} />
              </Grid>
              {[
                ["Registration opens", "registrationOpen"],
                ["Registration closes", "registrationClose"],
                ["Run starts", "eventStart"],
                ["Run ends", "eventEnd"],
                ["Pickup starts", "pickupStart"],
                ["Pickup ends", "pickupEnd"],
              ].map(([label, key]) => (
                <Grid item xs={12} md={4} key={key}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label={label}
                    InputLabelProps={{ shrink: true }}
                    value={toDateTimeInput(eventDraft[key as keyof EventDto] as string | undefined)}
                    onChange={(e) => patchEvent({ [key]: fromDateTimeInput(e.target.value) } as Partial<EventDto>)}
                  />
                </Grid>
              ))}
            </Grid>
            <Divider />
            <Typography variant="h5">Public event detail content</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth multiline minRows={2} label="Schedule summary" value={eventDraft.eventDetails?.scheduleSummary ?? ""} onChange={(e) => patchEventDetails({ scheduleSummary: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline minRows={2} label="Route notes" value={eventDraft.eventDetails?.routeNotes ?? ""} onChange={(e) => patchEventDetails({ routeNotes: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="T-shirt title" value={eventDraft.eventDetails?.tshirtTitle ?? ""} onChange={(e) => patchEventDetails({ tshirtTitle: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="T-shirt front image URL" value={eventDraft.eventDetails?.tshirtFrontImageUrl ?? ""} onChange={(e) => patchEventDetails({ tshirtFrontImageUrl: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline minRows={3} label="T-shirt description" value={eventDraft.eventDetails?.tshirtDescription ?? ""} onChange={(e) => patchEventDetails({ tshirtDescription: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="T-shirt back image URL" value={eventDraft.eventDetails?.tshirtBackImageUrl ?? ""} onChange={(e) => patchEventDetails({ tshirtBackImageUrl: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Kids size chart image URL" value={eventDraft.eventDetails?.kidsSizeChartImageUrl ?? ""} onChange={(e) => patchEventDetails({ kidsSizeChartImageUrl: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Adult size chart image URL" value={eventDraft.eventDetails?.adultSizeChartImageUrl ?? ""} onChange={(e) => patchEventDetails({ adultSizeChartImageUrl: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline minRows={3} label="Pickup disclaimer" value={eventDraft.eventDetails?.pickupDisclaimer ?? ""} onChange={(e) => patchEventDetails({ pickupDisclaimer: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline minRows={2} label="Donation / tax note" value={eventDraft.eventDetails?.donationNote ?? ""} onChange={(e) => patchEventDetails({ donationNote: e.target.value })} />
              </Grid>
            </Grid>
            <Divider />
            <Typography variant="h5">FAQ</Typography>
            <Stack spacing={1.5}>
              {(eventDraft.faqs ?? []).map((faq, index) => (
                <Box key={index} sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2 }}>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} md={5}>
                      <TextField fullWidth label="Question" value={faq.question} onChange={(e) => updateFaq(index, { question: e.target.value })} />
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <TextField fullWidth multiline minRows={2} label="Answer" value={faq.answer} onChange={(e) => updateFaq(index, { answer: e.target.value })} />
                    </Grid>
                    <Grid item xs={6} md={1}>
                      <TextField fullWidth type="number" label="Order" value={faq.displayOrder} onChange={(e) => updateFaq(index, { displayOrder: Number(e.target.value) })} />
                    </Grid>
                    <Grid item xs={6} md={1}>
                      <Stack spacing={1}>
                        <FormControlLabel control={<Switch checked={faq.active} onChange={(e) => updateFaq(index, { active: e.target.checked })} />} label="Active" />
                        <Button color="error" size="small" onClick={() => removeFaq(index)}>
                          Remove
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              ))}
              <Button
                variant="outlined"
                sx={{ alignSelf: "flex-start" }}
                onClick={() => patchEvent({ faqs: [...(eventDraft.faqs ?? []), { question: "", answer: "", displayOrder: (eventDraft.faqs?.length ?? 0) + 1, active: true }] })}
              >
                Add FAQ
              </Button>
            </Stack>
            <Divider />
            <Typography variant="h5">Contact and social links</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Contact recipient email" value={eventDraft.contactRecipientEmail ?? ""} onChange={(e) => patchEvent({ contactRecipientEmail: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Instagram URL" value={eventDraft.socialLinks?.instagramUrl ?? ""} onChange={(e) => patchSocialLinks({ instagramUrl: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Instagram logo URL" value={eventDraft.socialLinks?.instagramLogoUrl ?? "/ig_logo.jpg"} onChange={(e) => patchSocialLinks({ instagramLogoUrl: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Facebook URL" value={eventDraft.socialLinks?.facebookUrl ?? ""} onChange={(e) => patchSocialLinks({ facebookUrl: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Facebook logo URL" value={eventDraft.socialLinks?.facebookLogoUrl ?? "/fb_logo.jpg"} onChange={(e) => patchSocialLinks({ facebookLogoUrl: e.target.value })} />
              </Grid>
            </Grid>
            <Divider />
            <Typography variant="h5">Payment instructions</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="PayNow QR image URL" value={eventDraft.paymentInstructions?.payNowQrImageUrl ?? ""} onChange={(e) => patchPaymentInstructions({ payNowQrImageUrl: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Proof upload bucket" value={eventDraft.paymentInstructions?.proofBucket ?? "payment-proofs"} onChange={(e) => patchPaymentInstructions({ proofBucket: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline minRows={2} label="PayNow instruction text" value={eventDraft.paymentInstructions?.payNowInstruction ?? ""} onChange={(e) => patchPaymentInstructions({ payNowInstruction: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Bank name" value={eventDraft.paymentInstructions?.bankName ?? ""} onChange={(e) => patchPaymentInstructions({ bankName: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Bank account number" value={eventDraft.paymentInstructions?.bankAccountNumber ?? ""} onChange={(e) => patchPaymentInstructions({ bankAccountNumber: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Bank account name" value={eventDraft.paymentInstructions?.bankAccountName ?? ""} onChange={(e) => patchPaymentInstructions({ bankAccountName: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline minRows={2} label="Bank transfer instruction text" value={eventDraft.paymentInstructions?.bankInstruction ?? ""} onChange={(e) => patchPaymentInstructions({ bankInstruction: e.target.value })} />
              </Grid>
            </Grid>
            <Button variant="contained" sx={{ alignSelf: "flex-start" }} onClick={handleSaveEvent}>
              Save event and payment settings
            </Button>
          </Stack>
        ) : null}

        {tab === 2 ? (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5">Registration fields and categories</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Field visibility is saved now. Category editing is displayed here and will get full add/edit controls once the backend category update API is added.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
              {categories.map((category) => (
                <Chip key={category.id} label={`${category.name}${category.isActive ? "" : " (inactive)"}`} />
              ))}
              {!categories.length ? <Chip label="No categories loaded" color="warning" /> : null}
            </Stack>
            <Grid container spacing={2}>
              {formFields.map((field, index) => (
                <Grid item xs={12} md={6} key={`${field.fieldKey}-${index}`}>
                  <Box sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2 }}>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} md={5}>
                        <TextField fullWidth label="Field key" value={field.fieldKey} onChange={(e) => updateField(index, { fieldKey: e.target.value })} />
                      </Grid>
                      <Grid item xs={12} md={7}>
                        <TextField fullWidth label="Label" value={field.label} onChange={(e) => updateField(index, { label: e.target.value })} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Visibility</InputLabel>
                          <Select label="Visibility" value={field.visibility} onChange={(e) => updateField(index, { visibility: e.target.value })}>
                            <MenuItem value="required">Required</MenuItem>
                            <MenuItem value="optional">Optional</MenuItem>
                            <MenuItem value="hidden">Hidden</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Applies to</InputLabel>
                          <Select label="Applies to" value={field.appliesTo} onChange={(e) => updateField(index, { appliesTo: e.target.value })}>
                            <MenuItem value="payer">Payer</MenuItem>
                            <MenuItem value="participant">Participant</MenuItem>
                            <MenuItem value="corporate">Corporate</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <Button color="error" variant="outlined" size="small" onClick={() => removeField(index)}>
                          Remove field
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button variant="outlined" onClick={() => setFormFields([...formFields, { fieldKey: "", label: "", visibility: "optional", appliesTo: "participant", displayOrder: formFields.length + 1 }])}>
                Add field
              </Button>
              <Button variant="contained" onClick={handleSaveFormFields}>
                Save registration fields
              </Button>
            </Stack>
          </Stack>
        ) : null}

        {tab === 3 ? (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={7}>
              <Stack spacing={2}>
                <Typography variant="h5">Inventory by size</Typography>
                <Grid container spacing={1.5}>
                  {inventory.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} key={`${item.type}-${item.size}`}>
                      <Box sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2 }}>
                        <Typography fontWeight={800}>{item.type} / {item.size}</Typography>
                        <TextField
                          fullWidth
                          type="number"
                          label="Stock available"
                          value={item.quantityAvailable}
                          inputProps={{ min: 0 }}
                          sx={{ mt: 1 }}
                          onChange={(e) => updateInventoryItem(index, { quantityAvailable: Math.max(0, Number(e.target.value)) })}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Button variant="contained" sx={{ alignSelf: "flex-start" }} onClick={handleSaveInventory}>
                  Save inventory
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} lg={5}>
              <Stack spacing={3}>
                <Box sx={{ height: 280 }}>
                  <Typography fontWeight={800} sx={{ mb: 1 }}>Stock remaining</Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="size" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="quantityAvailable" fill="#c91f2e" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ height: 300 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between" alignItems={{ sm: "center" }} sx={{ mb: 1 }}>
                    <Typography fontWeight={800}>Sold per day</Typography>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel>Size</InputLabel>
                      <Select label="Size" value={soldSize} onChange={(e) => setSoldSize(e.target.value)}>
                        {["ALL", ...Array.from(new Set(inventory.map((item) => item.size))).filter(Boolean)].map((size) => (
                          <MenuItem key={size} value={size}>{size === "ALL" ? "All sizes" : size}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={soldDaily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <RechartsTooltip />
                      <Bar dataKey="quantitySold" fill="#10233d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        ) : null}

        {tab === 4 ? (
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
              <Box>
                <Typography variant="h5">Homepage slideshow</Typography>
                <Typography color="text.secondary">Configure Terry Fox and past-run images plus short blurbs.</Typography>
              </Box>
              <Button variant="outlined" onClick={() => setSlides([...slides, { imageUrl: "", blurb: "", displayOrder: slides.length + 1, active: true }])}>
                Add image
              </Button>
            </Stack>
            <Grid container spacing={2}>
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
                    <FormControlLabel
                      sx={{ mt: 1 }}
                      control={<Switch checked={slide.active} onChange={(e) => updateSlide(index, { active: e.target.checked })} />}
                      label="Active"
                    />
                    <Button color="error" variant="outlined" size="small" sx={{ ml: { sm: 2 } }} onClick={() => removeSlide(index)}>
                      Remove image
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Button variant="contained" sx={{ alignSelf: "flex-start" }} onClick={handleSaveSlides}>
              Save slideshow
            </Button>
          </Stack>
        ) : null}

        {tab === 5 && event ? (
          <Stack spacing={2}>
            <Typography variant="h5">Exports</Typography>
            <Typography color="text.secondary">
              Download operational CSVs for committee reporting, manual payment reconciliation, T-shirt collection, and launch rehearsal checks.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
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
          </Stack>
        ) : null}
      </Paper>
    </Stack>
  );
}
