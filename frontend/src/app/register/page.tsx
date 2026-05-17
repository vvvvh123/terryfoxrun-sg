"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { CategoryDto, EventDto, FormFieldConfig, ParticipantInput, RegistrationCreateResponse, createRegistration, getCategories, getCurrentEvent, getFormFields, submitPayment, uploadPaymentProof } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { defaultFormFields, isFieldRequired, isFieldVisible } from "@/lib/registrationFields";

type ParticipantForm = {
  name: string;
  email: string;
  phone: string;
  categoryId: number;
  tshirtSize: string;
  tshirtQty: number;
};

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

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

const emptyParticipant = (categoryId = 0): ParticipantForm => ({
  name: "",
  email: "",
  phone: "",
  categoryId,
  tshirtSize: "M",
  tshirtQty: 0,
});

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
  const [donationAmount, setDonationAmount] = useState(50);
  const [indemnityAccepted, setIndemnityAccepted] = useState(false);
  const [created, setCreated] = useState<RegistrationCreateResponse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"PAYNOW" | "BANK_TRANSFER">("PAYNOW");
  const [checkoutStep, setCheckoutStep] = useState<"instructions" | "proof">("instructions");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const shirtPrice = event?.shirtPrice ?? 3500;
  const shirtType = event?.shirtSizes?.[0]?.type ?? "adult";
  const paymentInstructions = event?.paymentInstructions ?? fallbackPaymentInstructions;
  const availableSizes = event?.shirtSizes?.length ? Array.from(new Set(event.shirtSizes.map((item) => item.size))) : sizes;
  const required = (key: string) => isFieldRequired(formFields, key);
  const visible = (key: string) => isFieldVisible(formFields, key);
  const eventDetails = event?.eventDetails;

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
      .catch(() => setError("Start the backend to submit a real registration."));
  }, []);

  const total = useMemo(() => {
    const allParticipants = [primaryParticipant, ...participants];
    const shirts = allParticipants.reduce((sum, participant) => sum + Number(participant.tshirtQty || 0) * shirtPrice, 0);
    return shirts + Number(donationAmount || 0) * 100;
  }, [donationAmount, participants, primaryParticipant, shirtPrice]);

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
    if (missingCategoryIndex >= 0) return `Please choose a category for ${missingCategoryIndex === 0 ? "the primary participant" : `additional participant ${missingCategoryIndex}`}.`;
    const negativeShirtIndex = allParticipants.findIndex((participant) => Number(participant.tshirtQty || 0) < 0);
    if (negativeShirtIndex >= 0) return "T-shirt quantity cannot be negative.";
    if (Number(donationAmount || 0) < 0) return "Donation amount cannot be negative.";
    if (!indemnityAccepted) return "Please accept the indemnity and PDPA consent before checkout.";
    return "";
  }

  function toParticipantInput(participant: ParticipantForm, index: number): ParticipantInput {
    const fallbackName = index === 0 ? payer.name : `Guest ${index}`;
    const fallbackPhone = participant.phone || "Optional phone not provided";
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
      tshirtSize: participant.tshirtQty > 0 ? participant.tshirtSize : undefined,
      tshirtType: participant.tshirtQty > 0 ? shirtType : undefined,
      tshirtQty: Number(participant.tshirtQty || 0),
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
      setCheckoutStep("instructions");
      setProofFile(null);
      setMessage("Registration created. Please complete your PayNow or bank-transfer payment.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    }
  }

  async function handleSubmitPayment(skipProofUpload = false) {
    if (!created) return;
    if (!user) return;
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
    setMessage("Payment cancelled. Your draft registration is not submitted for verification until you complete payment.");
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

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">Register</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Mobile-friendly participant registration with PayNow or bank transfer manual verification.
        </Typography>
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
          Sign in before checkout so we can save registrations, receipts, and pickup codes to My Events.
        </Alert>
      ) : null}
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
                {visible("tshirtSize") ? (
                  <Grid item xs={6} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>T-shirt size</InputLabel>
                      <Select label="T-shirt size" value={primaryParticipant.tshirtSize} onChange={(e) => updatePrimaryParticipant({ tshirtSize: e.target.value })}>
                        {availableSizes.map((size) => (
                          <MenuItem key={size} value={size}>
                            {size}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                ) : null}
                <Grid item xs={6} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="T-shirt quantity"
                    value={primaryParticipant.tshirtQty}
                    inputProps={{ min: 0 }}
                    helperText="Use 0 if you only want to register/donate."
                    onChange={(e) => updatePrimaryParticipant({ tshirtQty: Math.max(0, Number(e.target.value)) })}
                  />
                </Grid>
              </Grid>
            </Paper>
            <Paper sx={{ p: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={6}>
                      <TShirtImage src={eventDetails?.tshirtFrontImageUrl || eventDetails?.tshirtBackImageUrl || "/paynow-placeholder.svg"} alt="T-shirt front design" />
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
                    {eventDetails?.tshirtDescription ?? "T-shirt design and sizing information will be confirmed by the committee."}
                  </Typography>
                  <Chip sx={{ mt: 2 }} label={`${formatMoney(shirtPrice)} each`} />
                  {eventDetails?.pickupDisclaimer ? <Alert severity="info" sx={{ mt: 2 }}>{eventDetails.pickupDisclaimer}</Alert> : null}
                  {eventDetails?.donationNote ? <Alert severity="success" sx={{ mt: 2 }}>{eventDetails.donationNote}</Alert> : null}
                </Grid>
                {(eventDetails?.kidsSizeChartImageUrl || eventDetails?.adultSizeChartImageUrl) ? (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="h6" sx={{ mb: 1.5 }}>Size charts</Typography>
                    <Grid container spacing={2}>
                      {eventDetails?.kidsSizeChartImageUrl ? (
                        <Grid item xs={12} md={6}>
                          <Typography fontWeight={800} sx={{ mb: 1 }}>Kids</Typography>
                          <TShirtImage src={eventDetails.kidsSizeChartImageUrl} alt="Kids T-shirt size chart" />
                        </Grid>
                      ) : null}
                      {eventDetails?.adultSizeChartImageUrl ? (
                        <Grid item xs={12} md={6}>
                          <Typography fontWeight={800} sx={{ mb: 1 }}>Adult</Typography>
                          <TShirtImage src={eventDetails.adultSizeChartImageUrl} alt="Adult T-shirt size chart" />
                        </Grid>
                      ) : null}
                    </Grid>
                  </Grid>
                ) : null}
              </Grid>
            </Paper>
            <Paper sx={{ p: 3 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} justifyContent="space-between">
                <Box>
                  <Typography variant="h5">Additional Participants</Typography>
                  <Typography color="text.secondary">Category is required per participant. Name, email, and phone are optional for additional participants.</Typography>
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
                      {visible("tshirtSize") ? (
                        <Grid item xs={6} md={4}>
                          <FormControl fullWidth>
                            <InputLabel>T-shirt size</InputLabel>
                            <Select label="T-shirt size" value={participant.tshirtSize} onChange={(e) => updateParticipant(index, { tshirtSize: e.target.value })}>
                              {availableSizes.map((size) => (
                                <MenuItem key={size} value={size}>
                                  {size}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      ) : null}
                      <Grid item xs={6} md={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="T-shirt quantity"
                          value={participant.tshirtQty}
                          inputProps={{ min: 0 }}
                          onChange={(e) => updateParticipant(index, { tshirtQty: Math.max(0, Number(e.target.value)) })}
                        />
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
              <Typography variant="h5">Donation and review</Typography>
              <TextField
                fullWidth
                type="number"
                label="Additional donation"
                value={donationAmount}
                inputProps={{ min: 0 }}
                onChange={(e) => setDonationAmount(Math.max(0, Number(e.target.value)))}
                sx={{ mt: 2 }}
              />
              <Box sx={{ mt: 2, p: 2, bgcolor: "#f6f7fb", borderRadius: 2 }}>
                <Typography color="text.secondary">Estimated total</Typography>
                <Typography variant="h4">{formatMoney(total)}</Typography>
              </Box>
              <FormControlLabel
                sx={{ mt: 2, alignItems: "flex-start" }}
                control={<Checkbox checked={indemnityAccepted} onChange={(e) => setIndemnityAccepted(e.target.checked)} />}
                label={`${required("indemnity") ? "* " : ""}I agree to the indemnity and PDPA consent wording for this event.`}
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
                      Enter this reference in your payment comments so admin can match your transfer.
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
                      <Button fullWidth color="inherit" onClick={handleCancelPayment}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Alert severity="info">
                        A payment screenshot is optional, but it can help the admin team verify your payment faster.
                      </Alert>
                      <Button component="label" fullWidth variant="outlined" startIcon={<UploadFileIcon />}>
                        Upload screenshot
                        <input
                          hidden
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                        />
                      </Button>
                      {proofFile ? <Chip label={proofFile.name} variant="outlined" /> : null}
                      <Button fullWidth variant="contained" disabled={submittingPayment || !proofFile} onClick={() => handleSubmitPayment(false)}>
                        Submit payment proof
                      </Button>
                      <Button fullWidth disabled={submittingPayment} onClick={() => handleSubmitPayment(true)}>
                        I don&apos;t wish to upload
                      </Button>
                      <Button fullWidth color="inherit" onClick={() => setCheckoutStep("instructions")}>
                        Back to payment instructions
                      </Button>
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
