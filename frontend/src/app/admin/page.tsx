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
  AdminRegistrationReport,
  Announcement,
  CategoryDto,
  CorporateOrder,
  CorporatePackage,
  DailyInventorySold,
  EmailCampaign,
  EmailAudienceSegment,
  EventStats,
  EventDto,
  FormFieldConfig,
  PaymentAttempt,
  PickupResult,
  PickupSummary,
  RoleUsersResponse,
  ShirtInventoryItem,
  SlideshowImage,
  confirmPayment,
  copyEvent,
  createAnnouncement,
  createCategory,
  createCorporatePackage,
  createEmailCampaign,
  createEvent,
  deleteCategory,
  deleteEvent,
  deleteCorporatePackage,
  exportCsvUrl,
  getAdminRegistrations,
  getAnnouncements,
  getCategories,
  getCorporateOrders,
  getCorporatePackages,
  getCurrentEvent,
  getDailySold,
  getEmailCampaigns,
  getEmailAudiences,
  getEvents,
  getEventStats,
  getFormFields,
  getInventory,
  getPaymentAttempts,
  getPickupSummary,
  getPickupHistory,
  getRoleUsers,
  getSlideshow,
  rejectPayment,
  saveFormFields,
  saveSlideshow,
  setCurrentEvent,
  updateCategory,
  updateCorporateOrderStatus,
  updateCorporatePackage,
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

const packageSizes = ["XS", "S", "M", "L", "XL", "XXL"];

function parsePackageQuantities(json?: string) {
  try {
    const parsed = JSON.parse(json || "{}") as Record<string, Record<string, number>>;
    return parsed.adult ?? {};
  } catch {
    return {};
  }
}

function toPackageRulesJson(quantities: Record<string, number>) {
  const active = Object.fromEntries(Object.entries(quantities).filter(([, quantity]) => Number(quantity || 0) > 0));
  return JSON.stringify({ adult: active });
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
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [emailAudiences, setEmailAudiences] = useState<EmailAudienceSegment[]>([]);
  const [corporatePackages, setCorporatePackages] = useState<CorporatePackage[]>([]);
  const [corporateOrders, setCorporateOrders] = useState<CorporateOrder[]>([]);
  const [pickupSummary, setPickupSummary] = useState<PickupSummary | null>(null);
  const [pickupHistory, setPickupHistory] = useState<PickupResult[]>([]);
  const [roleUsers, setRoleUsers] = useState<RoleUsersResponse | null>(null);
  const [eventStats, setEventStats] = useState<EventStats | null>(null);
  const [registrationReport, setRegistrationReport] = useState<AdminRegistrationReport | null>(null);
  const [registrationSearch, setRegistrationSearch] = useState("");
  const [registrationPaymentFilter, setRegistrationPaymentFilter] = useState("");
  const [pickupSearch, setPickupSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING_ADMIN_VERIFICATION");
  const [methodFilter, setMethodFilter] = useState<"PAYNOW" | "BANK_TRANSFER" | "">("");
  const [adminTransactionIds, setAdminTransactionIds] = useState<Record<number, string>>({});
  const [rejectionReasons, setRejectionReasons] = useState<Record<number, string>>({});
  const [announcementDraft, setAnnouncementDraft] = useState({ title: "", body: "", channelDashboard: true, channelEmail: false });
  const [campaignDraft, setCampaignDraft] = useState({ audience: "confirmed-participants", subject: "", body: "", sendPreview: true });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadEventData = useCallback(async (targetEvent: EventDto) => {
    setEvent(targetEvent);
    setEventDraft(targetEvent);
    const [loadedPayments, inventoryItems, configuredSlides, loadedFields, loadedCategories, loadedAnnouncements, loadedCampaigns, loadedAudiences, loadedPackages, loadedCorporateOrders, loadedPickupSummary, loadedPickupHistory, loadedStats, loadedRegistrationReport] = await Promise.all([
      getPaymentAttempts({ status: statusFilter, method: methodFilter, eventId: targetEvent.id }),
      getInventory(targetEvent.id),
      getSlideshow(targetEvent.id),
      getFormFields(targetEvent.id),
      getCategories(targetEvent.id),
      getAnnouncements(targetEvent.id),
      getEmailCampaigns(targetEvent.id),
      getEmailAudiences(targetEvent.id),
      getCorporatePackages(targetEvent.id),
      getCorporateOrders(targetEvent.id),
      getPickupSummary(targetEvent.id),
      getPickupHistory({ eventId: targetEvent.id, query: pickupSearch }),
      getEventStats(targetEvent.id),
      getAdminRegistrations(targetEvent.id, { query: registrationSearch, paymentStatus: registrationPaymentFilter }),
    ]);
    setPayments(loadedPayments);
    setInventory(inventoryItems);
    setSlides(configuredSlides.length ? configuredSlides : [{ imageUrl: "", blurb: "", displayOrder: 1, active: true }]);
    setFormFields(loadedFields.length ? loadedFields : defaultFormFields);
    setCategories(loadedCategories);
    setAnnouncements(loadedAnnouncements);
    setCampaigns(loadedCampaigns);
    setEmailAudiences(loadedAudiences);
    setCorporatePackages(loadedPackages);
    setCorporateOrders(loadedCorporateOrders);
    setPickupSummary(loadedPickupSummary);
    setPickupHistory(loadedPickupHistory);
    setEventStats(loadedStats);
    setRegistrationReport(loadedRegistrationReport);
    setSoldDaily(await getDailySold(targetEvent.id, soldSize));
  }, [methodFilter, pickupSearch, registrationPaymentFilter, registrationSearch, soldSize, statusFilter]);

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
      setAnnouncements([]);
      setCampaigns([]);
      setEmailAudiences([]);
      setCorporatePackages([]);
      setCorporateOrders([]);
      setPickupSummary(null);
      setPickupHistory([]);
      setEventStats(null);
      setRegistrationReport(null);
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
    loadAdmin(selectedEventId).catch(() => setError("Admin tools are temporarily unavailable. Please try again later."));
  }, [appRole, loadAdmin, loading, selectedEventId, user]);

  useEffect(() => {
    if (loading || !user || appRole !== "admin") return;
    getRoleUsers().then(setRoleUsers).catch(() => setRoleUsers({
      users: [],
      counts: { admin: 0, volunteer: 0, participant: 0 },
      configured: false,
      message: "Could not load Supabase roles. Check backend role listing configuration.",
    }));
  }, [appRole, loading, user]);

  const metrics = useMemo(() => {
    const remaining = inventory.reduce((sum, item) => sum + Number(item.quantityAvailable || 0), 0);
    const confirmed = payments.filter((payment) => payment.verificationStatus === "CONFIRMED").length;
    return [
      { label: "Pending payments", value: payments.filter((payment) => payment.verificationStatus === "PENDING_ADMIN_VERIFICATION").length, help: "Payment attempts waiting for manual admin verification." },
      { label: "Confirmed in view", value: confirmed, help: "Confirmed payments matching the current payment filters." },
      { label: "Amount confirmed", value: formatMoney(eventStats?.confirmedAmount ?? 0), help: "Confirmed funds for the selected event." },
      { label: "Amount pending", value: formatMoney(eventStats?.pendingAmount ?? 0), help: "Funds waiting for manual payment verification." },
      { label: "Stock remaining", value: remaining, help: "Total available T-shirt stock for the selected event." },
      { label: "Collected pickups", value: pickupSummary?.collectedCount ?? 0, help: "Participants whose T-shirt pickup has been marked collected." },
      { label: "Active slides", value: slides.filter((slide) => slide.active).length, help: "Slideshow images currently enabled for the selected event homepage." },
    ];
  }, [eventStats, inventory, payments, pickupSummary, slides]);

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

  function updateCategoryDraft(index: number, patch: Partial<CategoryDto>) {
    setCategories((current) => current.map((category, currentIndex) => (currentIndex === index ? { ...category, ...patch } : category)));
  }

  function updateCorporatePackageDraft(index: number, patch: Partial<CorporatePackage>) {
    setCorporatePackages((current) => current.map((pkg, currentIndex) => (currentIndex === index ? { ...pkg, ...patch } : pkg)));
  }

  function updateCorporatePackageQuantity(index: number, size: string, quantity: number) {
    setCorporatePackages((current) =>
      current.map((pkg, currentIndex) => {
        if (currentIndex !== index) return pkg;
        const quantities = parsePackageQuantities(pkg.shirtAllocationRulesJson);
        quantities[size] = Math.max(0, quantity);
        return { ...pkg, shirtAllocationRulesJson: toPackageRulesJson(quantities) };
      }),
    );
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

  async function handleSaveCategories() {
    if (!event) return;
    setError("");
    try {
      for (const category of categories) {
        if (!category.name.trim()) continue;
        if (category.id) {
          await updateCategory(event.id, category.id, category);
        } else {
          await createCategory(event.id, category);
        }
      }
      setMessage("Categories saved.");
      await loadAdmin(event.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save categories.");
    }
  }

  async function handleDeleteCategory(category: CategoryDto) {
    if (!event) return;
    if (!category.id) {
      setCategories((current) => current.filter((candidate) => candidate !== category));
      return;
    }
    if (!window.confirm(`Delete category ${category.name}?`)) return;
    setError("");
    try {
      await deleteCategory(event.id, category.id);
      setMessage("Category deleted.");
      await loadAdmin(event.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete category.");
    }
  }

  async function handleCreateAnnouncement() {
    if (!event) return;
    setError("");
    try {
      await createAnnouncement(event.id, announcementDraft);
      setAnnouncementDraft({ title: "", body: "", channelDashboard: true, channelEmail: false });
      setMessage("Announcement created.");
      await loadAdmin(event.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create announcement.");
    }
  }

  async function handleCreateCampaign() {
    if (!event) return;
    setError("");
    try {
      await createEmailCampaign(event.id, campaignDraft);
      setCampaignDraft({ audience: "confirmed-participants", subject: "", body: "", sendPreview: true });
      setMessage("Email campaign saved.");
      await loadAdmin(event.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create email campaign.");
    }
  }

  async function handleSaveCorporatePackages() {
    if (!event) return;
    setError("");
    try {
      for (const pkg of corporatePackages) {
        if (!pkg.packageName.trim()) continue;
        if (pkg.id) {
          await updateCorporatePackage(event.id, pkg.id, pkg);
        } else {
          await createCorporatePackage(event.id, pkg);
        }
      }
      setMessage("Corporate packages saved.");
      await loadAdmin(event.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save corporate packages.");
    }
  }

  async function handleDeleteCorporatePackage(pkg: CorporatePackage) {
    if (!event) return;
    if (!pkg.id) {
      setCorporatePackages((current) => current.filter((candidate) => candidate !== pkg));
      return;
    }
    if (!window.confirm(`Delete corporate package ${pkg.packageName}?`)) return;
    setError("");
    try {
      await deleteCorporatePackage(event.id, pkg.id);
      setMessage("Corporate package deleted.");
      await loadAdmin(event.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete corporate package.");
    }
  }

  async function handleCorporateOrderStatus(orderId: number, status: string) {
    if (!event) return;
    setError("");
    try {
      await updateCorporateOrderStatus(orderId, status);
      setMessage("Corporate order status updated.");
      await loadAdmin(event.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update corporate order.");
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
              <Alert severity="info">No events are available yet. Create the first event to begin setup.</Alert>
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
          <Tab label="Event Stats" />
          <Tab label="Registrations" />
          <Tab label="Payments" />
          <Tab label="Announcements" />
          <Tab label="Corporate" />
          <Tab label="Event Setup" />
          <Tab label="Registration Fields" />
          <Tab label="Inventory" />
          <Tab label="Pickup" />
          <Tab label="Homepage Slideshow" />
          <Tab label="Roles" />
          <Tab label="Exports" />
        </Tabs>

        {tab === 0 ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography color="text.secondary">Confirmed amount raised</Typography>
                <Typography variant="h3">{formatMoney(eventStats?.confirmedAmount ?? 0)}</Typography>
                <Typography variant="body2" color="text.secondary">{eventStats?.confirmedPaymentCount ?? 0} confirmed registrations</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography color="text.secondary">Pending verification</Typography>
                <Typography variant="h3">{formatMoney(eventStats?.pendingAmount ?? 0)}</Typography>
                <Typography variant="body2" color="text.secondary">{eventStats?.pendingPaymentCount ?? 0} waiting for admin confirmation</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography color="text.secondary">Combined view</Typography>
                <Typography variant="h3">{formatMoney((eventStats?.confirmedAmount ?? 0) + (eventStats?.pendingAmount ?? 0))}</Typography>
                <Typography variant="body2" color="text.secondary">Shown as confirmed plus pending, not an official merged total.</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ height: 360 }}>
                <Typography variant="h5" sx={{ mb: 1 }}>Amount raised over time</Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eventStats?.dailyAmounts ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => `$${Number(value) / 100}`} />
                    <RechartsTooltip formatter={(value) => formatMoney(Number(value))} />
                    <Bar dataKey="cumulativeConfirmedAmount" name="Confirmed cumulative" fill="#2e7d32" />
                    <Bar dataKey="cumulativePendingAmount" name="Pending cumulative" fill="#f57c00" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
        ) : null}

        {tab === 1 ? (
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
              <Box>
                <Typography variant="h5">Registrations</Typography>
                <Typography color="text.secondary">Search registrations and monitor signup momentum for the selected event.</Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField label="Search registrations" value={registrationSearch} onChange={(e) => setRegistrationSearch(e.target.value)} sx={{ minWidth: { sm: 300 } }} />
                <FormControl sx={{ minWidth: 220 }}>
                  <InputLabel>Payment status</InputLabel>
                  <Select label="Payment status" value={registrationPaymentFilter} onChange={(e) => setRegistrationPaymentFilter(e.target.value)}>
                    <MenuItem value="">All statuses</MenuItem>
                    <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                    <MenuItem value="PENDING_ADMIN_VERIFICATION">Pending verification</MenuItem>
                    <MenuItem value="PAYMENT_REJECTED">Rejected</MenuItem>
                    <MenuItem value="UNPAID">Unpaid</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
            <Grid container spacing={2}>
              {[
                ["Total registrations", registrationReport?.counts.total ?? 0],
                ["Confirmed", registrationReport?.counts.confirmed ?? 0],
                ["Pending payment", registrationReport?.counts.pendingPayment ?? 0],
                ["Needs attention", registrationReport?.counts.rejected ?? 0],
              ].map(([label, value]) => (
                <Grid item xs={12} sm={6} md={3} key={label}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography color="text.secondary">{label}</Typography>
                    <Typography variant="h3">{value}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ height: 280 }}>
              <Typography fontWeight={800} sx={{ mb: 1 }}>Registrations over time</Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={registrationReport?.dailyRegistrations ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#10233d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Stack spacing={1.5}>
              {registrationReport?.registrations.map((registration) => (
                <Box key={registration.id} sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
                    <Box>
                      <Typography fontWeight={800}>{registration.payerName}</Typography>
                      <Typography color="text.secondary">
                        {registration.payerEmail} · {registration.generatedPaymentReference} · {registration.participantCount} participant{registration.participantCount === 1 ? "" : "s"}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip size="small" label={registration.status?.replaceAll("_", " ") ?? "status unknown"} />
                      <Chip size="small" color={registration.paymentStatus === "CONFIRMED" ? "success" : registration.paymentStatus === "PAYMENT_REJECTED" ? "error" : "warning"} label={registration.paymentStatus?.replaceAll("_", " ") ?? "payment unknown"} />
                    </Stack>
                  </Stack>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {formatMoney(registration.totalAmount)} · {registration.shirtSummary} · {registration.createdAt ? new Date(registration.createdAt).toLocaleString("en-SG") : "No date"}
                  </Typography>
                </Box>
              ))}
              {!registrationReport?.registrations.length ? <Typography color="text.secondary">No registrations match the current search.</Typography> : null}
            </Stack>
          </Stack>
        ) : null}

        {tab === 2 ? (
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

        {tab === 3 ? (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <Stack spacing={2}>
                <Typography variant="h5">Create announcement</Typography>
                <TextField fullWidth label="Title" value={announcementDraft.title} onChange={(e) => setAnnouncementDraft({ ...announcementDraft, title: e.target.value })} />
                <TextField fullWidth multiline minRows={4} label="Body" value={announcementDraft.body} onChange={(e) => setAnnouncementDraft({ ...announcementDraft, body: e.target.value })} />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <FormControlLabel control={<Switch checked={announcementDraft.channelDashboard} onChange={(e) => setAnnouncementDraft({ ...announcementDraft, channelDashboard: e.target.checked })} />} label="Show in dashboard" />
                  <FormControlLabel control={<Switch checked={announcementDraft.channelEmail} onChange={(e) => setAnnouncementDraft({ ...announcementDraft, channelEmail: e.target.checked })} />} label="Mark for email" />
                </Stack>
                <Button variant="contained" sx={{ alignSelf: "flex-start" }} onClick={handleCreateAnnouncement}>
                  Create announcement
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Stack spacing={2}>
                <Typography variant="h5">Mass email</Typography>
                <Typography color="text.secondary">Choose a fixed audience segment for the selected event.</Typography>
                <Stack spacing={1} sx={{ maxHeight: 260, overflowY: "auto", pr: 0.5 }}>
                  {emailAudiences.map((audience) => (
                    <Box
                      key={audience.key}
                      role="button"
                      tabIndex={0}
                      onClick={() => setCampaignDraft({ ...campaignDraft, audience: audience.key })}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") setCampaignDraft({ ...campaignDraft, audience: audience.key });
                      }}
                      sx={{
                        p: 1.5,
                        border: "1px solid",
                        borderColor: campaignDraft.audience === audience.key ? "#c91f2e" : "#e2e6ef",
                        borderRadius: 2,
                        cursor: "pointer",
                        bgcolor: campaignDraft.audience === audience.key ? "#fff5f5" : "white",
                      }}
                    >
                      <Stack direction="row" spacing={1} justifyContent="space-between">
                        <Typography fontWeight={800}>{audience.label}</Typography>
                        <Chip size="small" label={audience.count} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">{audience.description}</Typography>
                    </Box>
                  ))}
                </Stack>
                <TextField fullWidth label="Subject" value={campaignDraft.subject} onChange={(e) => setCampaignDraft({ ...campaignDraft, subject: e.target.value })} />
                <TextField fullWidth multiline minRows={4} label="Email body" value={campaignDraft.body} onChange={(e) => setCampaignDraft({ ...campaignDraft, body: e.target.value })} />
                <FormControlLabel control={<Switch checked={campaignDraft.sendPreview} onChange={(e) => setCampaignDraft({ ...campaignDraft, sendPreview: e.target.checked })} />} label="Create email preview" />
                <Button variant="contained" sx={{ alignSelf: "flex-start" }} onClick={handleCreateCampaign}>
                  Save campaign
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Previous announcements</Typography>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {announcements.map((announcement) => (
                  <Box key={announcement.id} sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2 }}>
                    <Typography fontWeight={800}>{announcement.title}</Typography>
                    <Typography color="text.secondary" sx={{ whiteSpace: "pre-line" }}>{announcement.body}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      {announcement.channelDashboard ? <Chip size="small" label="Dashboard" /> : null}
                      {announcement.channelEmail ? <Chip size="small" label="Email" /> : null}
                    </Stack>
                  </Box>
                ))}
                {!announcements.length ? <Typography color="text.secondary">No announcements yet.</Typography> : null}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Email campaigns</Typography>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {campaigns.map((campaign) => (
                  <Box key={campaign.id} sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2 }}>
                    <Typography fontWeight={800}>{campaign.subject}</Typography>
                    <Typography color="text.secondary">{campaign.audience} · {campaign.sentStatus}</Typography>
                  </Box>
                ))}
                {!campaigns.length ? <Typography color="text.secondary">No campaigns yet.</Typography> : null}
              </Stack>
            </Grid>
          </Grid>
        ) : null}

        {tab === 4 ? (
          <Stack spacing={3}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
              <Box>
                <Typography variant="h5">Corporate packages</Typography>
                <Typography color="text.secondary">Configure packages and review submitted corporate shirt orders.</Typography>
              </Box>
              <Button variant="outlined" onClick={() => setCorporatePackages([...corporatePackages, { packageName: "", price: 0, shirtAllocationRulesJson: toPackageRulesJson({}), active: true }])}>
                Add package
              </Button>
            </Stack>
            <Grid container spacing={2}>
              {corporatePackages.map((pkg, index) => (
                <Grid item xs={12} md={6} key={pkg.id ?? index}>
                  <Box sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2 }}>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} md={7}>
                        <TextField fullWidth label="Package name" value={pkg.packageName} onChange={(e) => updateCorporatePackageDraft(index, { packageName: e.target.value })} />
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <TextField fullWidth type="number" label="Price (SGD)" value={(pkg.price ?? 0) / 100} onChange={(e) => updateCorporatePackageDraft(index, { price: Math.round(Number(e.target.value || 0) * 100) })} />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography fontWeight={800} sx={{ mb: 1 }}>T-shirt allocation</Typography>
                        <Grid container spacing={1}>
                          {packageSizes.map((size) => {
                            const quantities = parsePackageQuantities(pkg.shirtAllocationRulesJson);
                            return (
                              <Grid item xs={6} sm={4} md={2} key={size}>
                                <TextField
                                  fullWidth
                                  type="number"
                                  label={size}
                                  value={quantities[size] ?? 0}
                                  inputProps={{ min: 0, "aria-label": `${pkg.packageName || "Corporate package"} ${size} quantity` }}
                                  onChange={(e) => updateCorporatePackageQuantity(index, size, Number(e.target.value))}
                                />
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel control={<Switch checked={pkg.active} onChange={(e) => updateCorporatePackageDraft(index, { active: e.target.checked })} />} label="Active" />
                        <Button color="error" variant="outlined" size="small" sx={{ ml: 1 }} onClick={() => handleDeleteCorporatePackage(pkg)}>
                          Remove
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Button variant="contained" sx={{ alignSelf: "flex-start" }} onClick={handleSaveCorporatePackages}>
              Save corporate packages
            </Button>
            <Divider />
            <Typography variant="h5">Corporate orders</Typography>
            <Stack spacing={1.5}>
              {corporateOrders.map((order) => (
                <Box key={order.id} sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2 }}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="space-between">
                    <Box>
                      <Typography fontWeight={800}>{order.companyName}</Typography>
                      <Typography color="text.secondary">{order.uen} · {order.contactName} · {order.contactEmail}</Typography>
                      <Typography color="text.secondary">{order.items.map((item) => `${item.quantity} x ${item.type} ${item.size}`).join(", ")}</Typography>
                    </Box>
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <InputLabel>Status</InputLabel>
                      <Select label="Status" value={order.status} onChange={(e) => handleCorporateOrderStatus(order.id, e.target.value)}>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="payment_confirmed">Payment confirmed</MenuItem>
                        <MenuItem value="fulfilled">Fulfilled</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                </Box>
              ))}
              {!corporateOrders.length ? <Typography color="text.secondary">No corporate orders yet.</Typography> : null}
            </Stack>
            {event ? (
              <Button component="a" href={exportCsvUrl(event.id, "corporate-orders")} target="_blank" rel="noreferrer" variant="outlined" sx={{ alignSelf: "flex-start" }}>
                Export corporate CSV
              </Button>
            ) : null}
          </Stack>
        ) : null}

        {tab === 5 && eventDraft ? (
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
              <Grid item xs={12}>
                <TextField fullWidth multiline minRows={4} label="Indemnity wording" value={eventDraft.eventDetails?.indemnityText ?? ""} onChange={(e) => patchEventDetails({ indemnityText: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline minRows={4} label="PDPA consent wording" value={eventDraft.eventDetails?.pdpaConsentText ?? ""} onChange={(e) => patchEventDetails({ pdpaConsentText: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline minRows={3} label="Refund / cancellation wording" value={eventDraft.eventDetails?.refundCancellationText ?? ""} onChange={(e) => patchEventDetails({ refundCancellationText: e.target.value })} />
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

        {tab === 6 ? (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5">Registration fields and categories</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Manage event categories and registration field visibility for the selected event.
              </Typography>
            </Box>
            <Stack spacing={1.5}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ md: "center" }}>
                <Typography variant="h6">Categories</Typography>
                <Button variant="outlined" onClick={() => setCategories([...categories, { id: 0, eventId: event?.id ?? 0, name: "", description: "", basePrice: 0, isActive: true }])}>
                  Add category
                </Button>
              </Stack>
              <Grid container spacing={2}>
                {categories.map((category, index) => (
                  <Grid item xs={12} md={6} key={`${category.id}-${index}`}>
                    <Box sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2 }}>
                      <Grid container spacing={1.5}>
                        <Grid item xs={12} md={6}>
                          <TextField fullWidth label="Category name" value={category.name} onChange={(e) => updateCategoryDraft(index, { name: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField fullWidth type="number" label="Base price (SGD)" value={(category.basePrice ?? 0) / 100} onChange={(e) => updateCategoryDraft(index, { basePrice: Math.round(Number(e.target.value || 0) * 100) })} />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth label="Description" value={category.description ?? ""} onChange={(e) => updateCategoryDraft(index, { description: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControlLabel control={<Switch checked={category.isActive} onChange={(e) => updateCategoryDraft(index, { isActive: e.target.checked })} />} label="Active" />
                          <Button color="error" variant="outlined" size="small" sx={{ ml: 1 }} onClick={() => handleDeleteCategory(category)}>
                            Remove category
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Button variant="contained" sx={{ alignSelf: "flex-start" }} onClick={handleSaveCategories}>
                Save categories
              </Button>
            </Stack>
            <Divider />
            <Typography variant="h6">Registration fields</Typography>
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

        {tab === 7 ? (
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

        {tab === 8 ? (
          <Stack spacing={2}>
            <Typography variant="h5">Pickup visibility</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography color="text.secondary">Collected</Typography>
                  <Typography variant="h3">{pickupSummary?.collectedCount ?? 0}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography color="text.secondary">Pending pickup</Typography>
                  <Typography variant="h3">{pickupSummary?.pendingCount ?? 0}</Typography>
                </Paper>
              </Grid>
            </Grid>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ md: "center" }}>
              <Typography variant="h6">Pickup history</Typography>
              <TextField
                label="Search pickup code or participant"
                value={pickupSearch}
                onChange={(e) => setPickupSearch(e.target.value)}
                sx={{ minWidth: { md: 360 } }}
              />
            </Stack>
            <Stack spacing={1.5}>
              {pickupHistory.map((item) => (
                <Box key={item.participantId} sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
                    <Typography fontWeight={800}>{item.participantName}</Typography>
                    <Chip size="small" label={item.result.replaceAll("_", " ")} />
                  </Stack>
                  <Typography color="text.secondary">
                    {item.pickupCode} · {(item.shirtOrders ?? []).length ? item.shirtOrders?.map((shirt) => `${shirt.quantity} x ${shirt.size}`).join(", ") : "No shirt"} · {item.pickupTimestamp ? new Date(item.pickupTimestamp).toLocaleString("en-SG") : "Not collected yet"}
                  </Typography>
                </Box>
              ))}
              {!pickupHistory.length ? <Typography color="text.secondary">No pickup records match the current search.</Typography> : null}
            </Stack>
          </Stack>
        ) : null}

        {tab === 9 ? (
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

        {tab === 10 ? (
          <Stack spacing={2}>
            <Box>
              <Typography variant="h5">Roles</Typography>
              <Typography color="text.secondary">View Supabase Auth user roles. Role changes are managed in Supabase.</Typography>
            </Box>
            {!roleUsers?.configured ? (
              <Alert severity="info">
                {roleUsers?.message ?? "Configure backend Supabase secret settings to list users."}
              </Alert>
            ) : null}
            <Grid container spacing={2}>
              {[
                ["Admins", roleUsers?.counts.admin ?? 0],
                ["Volunteers", roleUsers?.counts.volunteer ?? 0],
                ["Participants / none", roleUsers?.counts.participant ?? 0],
              ].map(([label, value]) => (
                <Grid item xs={12} md={4} key={label}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography color="text.secondary">{label}</Typography>
                    <Typography variant="h3">{value}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <Stack spacing={1.5}>
              {roleUsers?.users.map((roleUser) => (
                <Box key={roleUser.id || roleUser.email} sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
                    <Box>
                      <Typography fontWeight={800}>{roleUser.email || "Email unavailable"}</Typography>
                      <Typography color="text.secondary">
                        Created {roleUser.createdAt ? new Date(roleUser.createdAt).toLocaleString("en-SG") : "unknown"} · Last sign-in {roleUser.lastSignInAt ? new Date(roleUser.lastSignInAt).toLocaleString("en-SG") : "never"}
                      </Typography>
                    </Box>
                    <Chip label={roleUser.appRole || "participant"} color={roleUser.appRole === "admin" ? "error" : roleUser.appRole === "volunteer" ? "warning" : "default"} />
                  </Stack>
                </Box>
              ))}
              {!roleUsers?.users.length ? <Typography color="text.secondary">No role users to display yet.</Typography> : null}
            </Stack>
          </Stack>
        ) : null}

        {tab === 11 && event ? (
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
