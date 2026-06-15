"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  CategoryDto,
  EventDto,
  FormFieldConfig,
  ParticipantInput,
  RegistrationCreateResponse,
  ShirtOrder,
  createRegistration,
  getCategories,
  getCurrentEvent,
  getFormFields,
  submitPayment,
  uploadPaymentProof,
} from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { defaultFormFields, isFieldRequired, isFieldVisible } from "@/lib/registrationFields";

type ShirtType = "adult" | "kid";

type ShirtSelectionRow = {
  id: string;
  type: ShirtType;
  size: string;
  quantity: number;
};

type ParticipantForm = {
  name: string;
  email: string;
  phone: string;
  categoryId: number;
  shirtOrders: ShirtSelectionRow[];
};

const donationPresets = [0, 20, 50, 100];

const fallbackPaymentInstructions = {
  payNowQrImageUrl: "/paynow-placeholder.svg",
  payNowInstruction: "Scan the PayNow QR code and enter your Terry Fox Run reference in the payment comments.",
  bankName: "DBS Bank Pte Ltd",
  bankAccountNumber: "123-456-7890",
  bankAccountName: "Terry Fox Run Singapore",
  bankInstruction: "Transfer the exact amount and enter your Terry Fox Run reference in the transfer comments.",
  proofBucket: "payment-proofs",
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(cents / 100);
}

function formatDate(value?: string) {
  if (!value) return "To be confirmed";
  return new Intl.DateTimeFormat("en-SG", { dateStyle: "full", timeStyle: "short" }).format(new Date(value));
}

function displayIntegerInput(value?: number) {
  if (!value) return "";
  return String(value);
}

function normalizeShirtType(type?: string): ShirtType {
  return type?.toLowerCase() === "kid" ? "kid" : "adult";
}

function createRow(type: ShirtType, size: string): ShirtSelectionRow {
  return {
    id: `${type}-${size}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    size,
    quantity: 1,
  };
}

function emptyParticipant(categoryId = 0): ParticipantForm {
  return {
    name: "",
    email: "",
    phone: "",
    categoryId,
    shirtOrders: [],
  };
}

function TShirtImage({ src, alt }: { src?: string; alt: string }) {
  if (!src) return null;
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      sx={{
        width: "100%",
        maxHeight: 300,
        objectFit: "contain",
        bgcolor: "white",
        border: "1px solid #e2e6ef",
        borderRadius: 2,
        p: 1,
      }}
    />
  );
}

const fallbackLegalText = "Terms to be confirmed by the event organiser.";

function LegalTextBlock({ title, body }: { title: string; body?: string }) {
  return (
    <Box sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2 }}>
      <Typography fontWeight={800}>{title}</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75, whiteSpace: "pre-line" }}>
        {body?.trim() || fallbackLegalText}
      </Typography>
    </Box>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventDto | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [payer, setPayer] = useState({
    name: "",
    email: "",
    identity: "",
    address: "",
    bloodType: "",
  });
  const [primaryParticipant, setPrimaryParticipant] = useState<ParticipantForm>(emptyParticipant());
  const [participants, setParticipants] = useState<ParticipantForm[]>([]);
  const [formFields, setFormFields] = useState<FormFieldConfig[]>(defaultFormFields);
  const [donationAmount, setDonationAmount] = useState(20);
  const [indemnityAccepted, setIndemnityAccepted] = useState(false);
  const [created, setCreated] = useState<RegistrationCreateResponse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"PAYNOW" | "BANK_TRANSFER">("PAYNOW");
  const [checkoutStep, setCheckoutStep] = useState<"instructions" | "proof">("instructions");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const shirtPrice = event?.shirtPrice ?? 3500;
  const paymentInstructions = event?.paymentInstructions ?? fallbackPaymentInstructions;
  const eventDetails = event?.eventDetails;
  const required = (key: string) => isFieldRequired(formFields, key);
  const visible = (key: string) => isFieldVisible(formFields, key);

  const sizeOptions = useMemo(() => {
    const options = event?.shirtSizes ?? [];
    const adult = Array.from(new Set(options.filter((item) => normalizeShirtType(item.type) === "adult").map((item) => item.size)));
    const kid = Array.from(new Set(options.filter((item) => normalizeShirtType(item.type) === "kid").map((item) => item.size)));
    return {
      adult: adult.length ? adult : ["XS", "S", "M", "L", "XL", "XXL"],
      kid,
    };
  }, [event?.shirtSizes]);

  useEffect(() => {
    getCurrentEvent()
      .then(async (current) => {
        setEvent(current);
        const loadedCategories = await getCategories(current.id);
        setCategories(loadedCategories);
        const loadedFields = await getFormFields(current.id);
        setFormFields(loadedFields.length ? loadedFields : defaultFormFields);
        const defaultCategoryId = loadedCategories[0]?.id ?? 0;
        setPrimaryParticipant(emptyParticipant(defaultCategoryId));
        setParticipants([]);
      })
      .catch(() => setError("We could not load registration details. Please try again later."));
  }, []);

  const participantShirtOrders = useCallback((participant: ParticipantForm): ShirtOrder[] => {
    return participant.shirtOrders
      .filter((shirt) => Number(shirt.quantity || 0) > 0)
      .map((shirt) => ({ size: shirt.size, type: shirt.type, quantity: Number(shirt.quantity || 0) }));
  }, []);

  const total = useMemo(() => {
    const allParticipants = [primaryParticipant, ...participants];
    const shirts = allParticipants.reduce(
      (sum, participant) =>
        sum + participantShirtOrders(participant).reduce((shirtSum, shirt) => shirtSum + Number(shirt.quantity || 0) * shirtPrice, 0),
      0,
    );
    return shirts + Number(donationAmount || 0) * 100;
  }, [donationAmount, participantShirtOrders, participants, primaryParticipant, shirtPrice]);

  function getTypeSizes(type: ShirtType) {
    return type === "kid" ? sizeOptions.kid : sizeOptions.adult;
  }

  function addShirtRow(participant: ParticipantForm, type: ShirtType = "adult"): ParticipantForm {
    const options = getTypeSizes(type);
    const existingSizes = new Set(participant.shirtOrders.filter((row) => row.type === type).map((row) => row.size));
    const nextSize = options.find((size) => !existingSizes.has(size)) ?? options[0];
    if (!nextSize) return participant;
    return {
      ...participant,
      shirtOrders: [...participant.shirtOrders, createRow(type, nextSize)],
    };
  }

  function updateShirtRow(participant: ParticipantForm, rowId: string, patch: Partial<ShirtSelectionRow>): ParticipantForm {
    return {
      ...participant,
      shirtOrders: participant.shirtOrders.map((row) => {
        if (row.id !== rowId) return row;
        const nextType = patch.type ?? row.type;
        const nextSizeOptions = getTypeSizes(nextType);
        const nextSize = patch.size ?? (nextSizeOptions.includes(row.size) ? row.size : nextSizeOptions[0]);
        return {
          ...row,
          ...patch,
          type: nextType,
          size: nextSize ?? row.size,
          quantity: patch.quantity == null ? row.quantity : Math.max(0, patch.quantity),
        };
      }),
    };
  }

  function removeShirtRow(participant: ParticipantForm, rowId: string): ParticipantForm {
    return {
      ...participant,
      shirtOrders: participant.shirtOrders.filter((row) => row.id !== rowId),
    };
  }

  function updateParticipant(index: number, patch: Partial<ParticipantForm>) {
    setParticipants((current) => current.map((participant, currentIndex) => (currentIndex === index ? { ...participant, ...patch } : participant)));
  }

  function updatePrimaryParticipant(patch: Partial<ParticipantForm>) {
    setPrimaryParticipant((current) => ({ ...current, ...patch }));
  }

  function validateRegistration() {
    const requiredPayerFields = [
      ["name", payer.name],
      ["email address", payer.email],
      ["NRIC / Passport / FIN", payer.identity],
      ["Singapore address", payer.address],
      ["blood type", payer.bloodType],
    ];
    const missing = requiredPayerFields.find(([, value]) => !String(value).trim());
    if (missing) return `Please enter the payer ${missing[0]}.`;
    if (!payer.email.includes("@")) return "Please enter a valid payer email address.";
    if (!primaryParticipant.categoryId) return "Please choose a category for the primary participant.";
    const allParticipants = [primaryParticipant, ...participants];
    const missingCategoryIndex = allParticipants.findIndex((participant) => !participant.categoryId);
    if (missingCategoryIndex >= 0) {
      return `Please choose a category for ${missingCategoryIndex === 0 ? "the primary participant" : `additional participant ${missingCategoryIndex}`}.`;
    }
    const duplicateShirtIndex = allParticipants.findIndex((participant) => {
      const combinations = participant.shirtOrders.map((shirt) => `${shirt.type}:${shirt.size}`);
      return new Set(combinations).size !== combinations.length;
    });
    if (duplicateShirtIndex >= 0) return "Please use each shirt size only once per participant.";
    const negativeShirtIndex = allParticipants.findIndex((participant) => participant.shirtOrders.some((shirt) => Number(shirt.quantity || 0) < 0));
    if (negativeShirtIndex >= 0) return "T-shirt quantity cannot be negative.";
    if (Number(donationAmount || 0) < 0) return "Donation amount cannot be negative.";
    if (!indemnityAccepted) return "Please accept the indemnity and PDPA consent before checkout.";
    return "";
  }

  function toParticipantInput(participant: ParticipantForm, index: number): ParticipantInput {
    const fallbackName = index === 0 ? payer.name : `Guest ${index}`;
    const fallbackPhone = participant.phone || "Optional phone not provided";
    const shirtOrders = participantShirtOrders(participant);
    const firstShirt = shirtOrders[0];
    return {
      categoryId: participant.categoryId || categories[0]?.id || 1,
      name: participant.name || fallbackName,
      email: participant.email || payer.email,
      phone: fallbackPhone,
      emergencyContactName: "Optional emergency contact not collected",
      emergencyContactPhone: fallbackPhone,
      dob: "1900-01-01",
      gender: "Optional gender not collected",
      address: payer.address,
      nricLast4: payer.identity.slice(-4) || "NA",
      medicalNotes: "",
      tshirtSize: firstShirt?.size,
      tshirtType: firstShirt?.type,
      tshirtQty: firstShirt?.quantity ?? 0,
      shirtOrders,
    };
  }

  async function handleCreateRegistration() {
    if (!event) {
      setError("Event details are not loaded yet.");
      return;
    }
    if (!user) {
      setError("Please sign in before checkout so your registration appears in My Events.");
      return;
    }
    const validationError = validateRegistration();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setMessage("");
    try {
      const response = await createRegistration({
        eventId: event.id,
        payerName: payer.name,
        payerEmail: payer.email,
        payerIdentityNumber: payer.identity,
        payerAddress: payer.address,
        payerBloodType: payer.bloodType,
        participants: [primaryParticipant, ...participants].map(toParticipantInput),
        donationAmount: Number(donationAmount || 0) * 100,
        extraShirts: [],
        indemnityAccepted,
      });
      window.localStorage.setItem("lastRegistrationId", String(response.registrationId));
      setCreated(response);
      if (response.totalAmount === 0 || response.paymentStatus === "CONFIRMED") {
        router.push(`/confirmation?registrationId=${response.registrationId}`);
        return;
      }
      setCheckoutStep("instructions");
      setProofFile(null);
      setMessage("Registration created. Please complete your payment to finish checkout.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    }
  }

  async function handleSubmitPayment(skipProofUpload = false) {
    if (!created || !user) return;
    setError("");
    setSubmittingPayment(true);
    try {
      let proofFileUrl: string | undefined;
      if (proofFile && !skipProofUpload) {
        proofFileUrl = await uploadPaymentProof({
          bucket: paymentInstructions.proofBucket ?? "payment-proofs",
          file: proofFile,
          registrationId: created.registrationId,
          userId: user.id,
        });
      }
      await submitPayment(created.registrationId, {
        method: paymentMethod,
        userTransactionId: created.generatedPaymentReference,
        proofFileUrl,
      });
      router.push(`/confirmation?registrationId=${created.registrationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment submission failed.");
    } finally {
      setSubmittingPayment(false);
    }
  }

  function handleCancelPayment() {
    setCreated(null);
    setProofFile(null);
    setCheckoutStep("instructions");
    setMessage("Payment cancelled. Your registration will stay in draft until you return to checkout.");
  }

  function copyText(value: string) {
    navigator.clipboard?.writeText(value).catch(() => undefined);
  }

  function CopyableDetail({ label, value }: { label: string; value: string }) {
    return (
      <Box sx={{ p: 1.5, border: "1px solid #e2e6ef", borderRadius: 2, bgcolor: "white" }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Typography fontWeight={800} sx={{ wordBreak: "break-word" }}>
            {value}
          </Typography>
          <IconButton aria-label={`Copy ${label}`} size="small" onClick={() => copyText(value)}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    );
  }

  function renderShirtSection(
    participant: ParticipantForm,
    onChange: (next: ParticipantForm) => void,
    labelPrefix: string,
  ) {
    return (
      <Box sx={{ mt: 1 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
          <Typography fontWeight={800}>T-shirts</Typography>
          <Typography color="text.secondary">{formatMoney(shirtPrice)} each</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Choose any sizes you would like for this participant. Leave this empty if no T-shirt is needed.
        </Typography>
        <Stack spacing={1.25} sx={{ mt: 1.5 }}>
          {participant.shirtOrders.map((row, rowIndex) => {
            const typeOptions: ShirtType[] = sizeOptions.kid.length ? ["adult", "kid"] : ["adult"];
            const sizeChoices = getTypeSizes(row.type);
            const usedSizes = new Set(
              participant.shirtOrders
                .filter((item) => item.type === row.type && item.id !== row.id)
                .map((item) => item.size),
            );
            const allowedSizes = sizeChoices.filter((size) => size === row.size || !usedSizes.has(size));
            return (
              <Grid container spacing={1.25} key={row.id} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      label="Type"
                      value={row.type}
                      onChange={(event) => onChange(updateShirtRow(participant, row.id, { type: event.target.value as ShirtType }))}
                      inputProps={{ "aria-label": `${labelPrefix} shirt type ${rowIndex + 1}` }}
                    >
                      {typeOptions.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type === "adult" ? "Adult" : "Kids"}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Size</InputLabel>
                    <Select
                      label="Size"
                      value={row.size}
                      onChange={(event) => onChange(updateShirtRow(participant, row.id, { size: String(event.target.value) }))}
                      inputProps={{ "aria-label": `${labelPrefix} shirt size ${rowIndex + 1}` }}
                    >
                      {allowedSizes.map((size) => (
                        <MenuItem key={size} value={size}>
                          {size}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={9} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Quantity"
                    value={displayIntegerInput(row.quantity)}
                    inputProps={{ min: 0, "aria-label": `${labelPrefix} shirt quantity ${rowIndex + 1}` }}
                    onChange={(event) => onChange(updateShirtRow(participant, row.id, { quantity: Number(event.target.value || 0) }))}
                  />
                </Grid>
                <Grid item xs={3} sm={1}>
                  <IconButton
                    aria-label={`Remove shirt selection ${rowIndex + 1}`}
                    color="error"
                    onClick={() => onChange(removeShirtRow(participant, row.id))}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Grid>
              </Grid>
            );
          })}
          {!participant.shirtOrders.length ? (
            <Typography variant="body2" color="text.secondary">
              No shirts selected yet.
            </Typography>
          ) : null}
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1.5 }}>
          <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={() => onChange(addShirtRow(participant, "adult"))}>
            Add shirt size
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">Register</Typography>
      </Box>
      {error ? <Alert severity="warning">{error}</Alert> : null}
      {message ? <Alert severity="success">{message}</Alert> : null}
      {!user ? (
        <Alert
          severity="info"
          action={
            <Button component={Link} href="/login" color="inherit" size="small">
              Sign in
            </Button>
          }
        >
          Sign in before checkout so we can save your registration, receipt, and pickup code in My Events.
        </Alert>
      ) : null}

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h4">{event ? `${event.name}, ${event.year}` : "Event overview"}</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 900 }}>
              Review the run details below before completing your registration.
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography fontWeight={800}>Run date and time</Typography>
              <Typography color="text.secondary">{formatDate(event?.eventStart)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography fontWeight={800}>Venue</Typography>
              <Typography color="text.secondary">{event?.locationEvent ?? "Venue to be confirmed"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography fontWeight={800}>Registration closes</Typography>
              <Typography color="text.secondary">{formatDate(event?.registrationClose)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography fontWeight={800}>T-shirt pickup</Typography>
              <Typography color="text.secondary">
                {event?.locationPickup ?? "Pickup venue to be confirmed"} · {formatDate(event?.pickupStart)}
              </Typography>
            </Grid>
          </Grid>
          {(eventDetails?.scheduleSummary || eventDetails?.routeNotes) ? (
            <Box>
              {eventDetails?.scheduleSummary ? <Typography>{eventDetails.scheduleSummary}</Typography> : null}
              {eventDetails?.routeNotes ? (
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  {eventDetails.routeNotes}
                </Typography>
              ) : null}
            </Box>
          ) : null}
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {(categories.length ? categories : [{ id: 0, name: "5K / 10K Fun Run" }]).map((category) => (
              <Chip key={category.id} label={category.name} />
            ))}
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <TShirtImage
                  src={eventDetails?.tshirtFrontImageUrl || eventDetails?.tshirtBackImageUrl || "/paynow-placeholder.svg"}
                  alt="T-shirt front design"
                />
              </Grid>
              {eventDetails?.tshirtBackImageUrl ? (
                <Grid item xs={12} sm={6}>
                  <TShirtImage src={eventDetails.tshirtBackImageUrl} alt="T-shirt back design" />
                </Grid>
              ) : null}
            </Grid>
          </Grid>
          <Grid item xs={12} md={7}>
            <Typography variant="h5">{eventDetails?.tshirtTitle ?? `${event?.year ?? ""} Terry Fox Run T-Shirt`}</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, whiteSpace: "pre-line" }}>
              {eventDetails?.tshirtDescription ?? "T-shirt design and sizing information will be published here."}
            </Typography>
            <Chip sx={{ mt: 2 }} label={`${formatMoney(shirtPrice)} each`} />
            {eventDetails?.pickupDisclaimer ? <Alert severity="info" sx={{ mt: 2 }}>{eventDetails.pickupDisclaimer}</Alert> : null}
            {eventDetails?.donationNote ? <Alert severity="success" sx={{ mt: 2 }}>{eventDetails.donationNote}</Alert> : null}
          </Grid>
          {(eventDetails?.kidsSizeChartImageUrl || eventDetails?.adultSizeChartImageUrl) ? (
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                Size charts
              </Typography>
              <Grid container spacing={2}>
                {eventDetails?.kidsSizeChartImageUrl ? (
                  <Grid item xs={12} md={6}>
                    <Typography fontWeight={800} sx={{ mb: 1 }}>
                      Kids
                    </Typography>
                    <TShirtImage src={eventDetails.kidsSizeChartImageUrl} alt="Kids T-shirt size chart" />
                  </Grid>
                ) : null}
                {eventDetails?.adultSizeChartImageUrl ? (
                  <Grid item xs={12} md={6}>
                    <Typography fontWeight={800} sx={{ mb: 1 }}>
                      Adult
                    </Typography>
                    <TShirtImage src={eventDetails.adultSizeChartImageUrl} alt="Adult T-shirt size chart" />
                  </Grid>
                ) : null}
              </Grid>
            </Grid>
          ) : null}
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Stack spacing={2}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5">Payer and primary participant</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                The payer is counted as the primary participant. You can add family, friends, or colleagues below.
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField required={required("payerName")} fullWidth label="Name" value={payer.name} onChange={(e) => setPayer({ ...payer, name: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField required={required("payerEmail")} fullWidth label="Email address" value={payer.email} onChange={(e) => setPayer({ ...payer, email: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField required={required("payerIdentityNumber")} fullWidth label="NRIC / Passport / FIN" value={payer.identity} onChange={(e) => setPayer({ ...payer, identity: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField required={required("payerBloodType")} fullWidth label="Blood type" value={payer.bloodType} onChange={(e) => setPayer({ ...payer, bloodType: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField required={required("payerAddress")} fullWidth label="Address in Singapore" value={payer.address} onChange={(e) => setPayer({ ...payer, address: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl required={required("participantCategory")} fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select label="Category" value={primaryParticipant.categoryId || ""} onChange={(e) => updatePrimaryParticipant({ categoryId: Number(e.target.value) })}>
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  {renderShirtSection(primaryParticipant, setPrimaryParticipant, "Primary participant")}
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} justifyContent="space-between">
                <Box>
                  <Typography variant="h5">Additional Participants</Typography>
                  <Typography color="text.secondary">
                    Category is required per participant. Name, email, and phone are optional for additional participants.
                  </Typography>
                </Box>
                <Button variant="outlined" onClick={() => setParticipants([...participants, emptyParticipant(categories[0]?.id ?? 0)])}>
                  Add participant
                </Button>
              </Stack>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {participants.map((participant, index) => (
                  <Box key={index} sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Typography fontWeight={800}>Additional participant {index + 1}</Typography>
                      <Button color="error" size="small" onClick={() => setParticipants((current) => current.filter((_, currentIndex) => currentIndex !== index))}>
                        Remove
                      </Button>
                    </Stack>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Name" helperText="Optional" value={participant.name} onChange={(e) => updateParticipant(index, { name: e.target.value })} />
                      </Grid>
                      {visible("participantEmail") ? (
                        <Grid item xs={12} md={4}>
                          <TextField fullWidth label="Email" helperText="Optional" value={participant.email} onChange={(e) => updateParticipant(index, { email: e.target.value })} />
                        </Grid>
                      ) : null}
                      {visible("participantPhone") ? (
                        <Grid item xs={12} md={4}>
                          <TextField fullWidth label="Phone" helperText="Optional" value={participant.phone} onChange={(e) => updateParticipant(index, { phone: e.target.value })} />
                        </Grid>
                      ) : null}
                      <Grid item xs={12} md={4}>
                        <FormControl required={required("participantCategory")} fullWidth>
                          <InputLabel>Category</InputLabel>
                          <Select label="Category" value={participant.categoryId || ""} onChange={(e) => updateParticipant(index, { categoryId: Number(e.target.value) })}>
                            {categories.map((category) => (
                              <MenuItem key={category.id} value={category.id}>
                                {category.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        {renderShirtSection(participant, (next) => updateParticipant(index, next), `Additional participant ${index + 1}`)}
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Stack spacing={2}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5">Donation</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Add an optional donation to support cancer research.
              </Typography>
              <Grid container spacing={1} sx={{ mt: 2 }}>
                {donationPresets.map((amount) => (
                  <Grid item xs={6} sm={3} lg={6} key={amount}>
                    <Button fullWidth variant={donationAmount === amount ? "contained" : "outlined"} onClick={() => setDonationAmount(amount)}>
                      ${amount}
                    </Button>
                  </Grid>
                ))}
              </Grid>
              <TextField
                fullWidth
                type="number"
                label="Custom donation"
                value={displayIntegerInput(donationAmount)}
                inputProps={{ min: 0 }}
                onChange={(e) => setDonationAmount(Math.max(0, Number(e.target.value || 0)))}
                sx={{ mt: 2 }}
              />
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h5">Review</Typography>
              <Box sx={{ mt: 2, p: 2, bgcolor: "#f6f7fb", borderRadius: 2 }}>
                <Typography color="text.secondary">Donation</Typography>
                <Typography variant="h5">{formatMoney(Number(donationAmount || 0) * 100)}</Typography>
              </Box>
              <Box sx={{ mt: 2, p: 2, bgcolor: "#f6f7fb", borderRadius: 2 }}>
                <Typography color="text.secondary">Estimated total</Typography>
                <Typography variant="h4">{formatMoney(total)}</Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography fontWeight={800}>Event terms</Typography>
                <Stack spacing={1.25} sx={{ mt: 1 }}>
                  <LegalTextBlock title="Indemnity" body={eventDetails?.indemnityText} />
                  <LegalTextBlock title="PDPA consent" body={eventDetails?.pdpaConsentText} />
                  <LegalTextBlock title="Refund / cancellation" body={eventDetails?.refundCancellationText} />
                </Stack>
              </Box>
              <FormControlLabel
                sx={{ mt: 2, alignItems: "flex-start" }}
                control={<Checkbox checked={indemnityAccepted} onChange={(e) => setIndemnityAccepted(e.target.checked)} />}
                label={`${required("indemnity") ? "* " : ""}I have read and agree to the indemnity, PDPA consent, and refund/cancellation terms for this event.`}
              />
              <Button fullWidth variant="contained" size="large" sx={{ mt: 2 }} disabled={!indemnityAccepted || !event || !user} onClick={handleCreateRegistration}>
                Continue to payment
              </Button>
            </Paper>

            {created ? (
              <Paper sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h5">Checkout</Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      Enter this reference in your payment comments so the Terry Fox Run team can match your transfer.
                    </Typography>
                  </Box>
                  <CopyableDetail label="Payment reference" value={created.generatedPaymentReference} />
                  <Box sx={{ p: 2, bgcolor: "#f6f7fb", borderRadius: 2 }}>
                    <Typography color="text.secondary">Amount payable</Typography>
                    <Typography variant="h4">{formatMoney(created.totalAmount)}</Typography>
                  </Box>
                  {checkoutStep === "instructions" ? (
                    <>
                      <FormControl fullWidth>
                        <InputLabel>Payment method</InputLabel>
                        <Select label="Payment method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as "PAYNOW" | "BANK_TRANSFER")}>
                          <MenuItem value="PAYNOW">PayNow</MenuItem>
                          <MenuItem value="BANK_TRANSFER">Bank transfer</MenuItem>
                        </Select>
                      </FormControl>
                      {paymentMethod === "PAYNOW" ? (
                        <Box sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2 }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <QrCode2Icon color="primary" />
                            <Typography fontWeight={800}>PayNow QR</Typography>
                          </Stack>
                          <Box
                            component="img"
                            src={paymentInstructions.payNowQrImageUrl ?? fallbackPaymentInstructions.payNowQrImageUrl}
                            alt="PayNow QR code"
                            sx={{ width: "100%", maxWidth: 260, display: "block", mx: "auto", border: "1px solid #e2e6ef", borderRadius: 2, bgcolor: "white" }}
                          />
                          <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                            {paymentInstructions.payNowInstruction}
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2 }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                            <AccountBalanceIcon color="primary" />
                            <Typography fontWeight={800}>Bank transfer</Typography>
                          </Stack>
                          <Stack spacing={1}>
                            <CopyableDetail label="Bank name" value={paymentInstructions.bankName ?? fallbackPaymentInstructions.bankName} />
                            <CopyableDetail label="Account number" value={paymentInstructions.bankAccountNumber ?? fallbackPaymentInstructions.bankAccountNumber} />
                            <CopyableDetail label="Account name" value={paymentInstructions.bankAccountName ?? fallbackPaymentInstructions.bankAccountName} />
                          </Stack>
                          <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                            {paymentInstructions.bankInstruction}
                          </Typography>
                        </Box>
                      )}
                      <Divider />
                      <Button fullWidth variant="contained" startIcon={<CheckCircleOutlineIcon />} onClick={() => setCheckoutStep("proof")}>
                        I have paid
                      </Button>
                      <Button fullWidth variant="text" color="inherit" onClick={handleCancelPayment}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography color="text.secondary">Uploading a payment screenshot is optional.</Typography>
                      <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
                        {proofFile ? proofFile.name : "Upload screenshot"}
                        <input hidden type="file" accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0] ?? null)} />
                      </Button>
                      <Stack spacing={1.5}>
                        <Button fullWidth variant="contained" disabled={submittingPayment} onClick={() => handleSubmitPayment(false)}>
                          Submit payment
                        </Button>
                        <Button fullWidth variant="outlined" disabled={submittingPayment} onClick={() => handleSubmitPayment(true)}>
                          I don&apos;t wish to upload
                        </Button>
                      </Stack>
                    </>
                  )}
                </Stack>
              </Paper>
            ) : null}
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
