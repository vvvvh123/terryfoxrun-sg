"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { CategoryDto, EventDto, ParticipantInput, RegistrationCreateResponse, createRegistration, getCategories, getCurrentEvent, submitPayment } from "@/lib/api";

type ParticipantForm = {
  name: string;
  email: string;
  phone: string;
  categoryId: number;
  tshirtSize: string;
  tshirtQty: number;
};

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

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

export default function RegisterPage() {
  const router = useRouter();
  const [event, setEvent] = useState<EventDto | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [payer, setPayer] = useState({
    name: "",
    email: "",
    identity: "",
    address: "",
    bloodType: "",
  });
  const [participants, setParticipants] = useState<ParticipantForm[]>([emptyParticipant()]);
  const [donationAmount, setDonationAmount] = useState(50);
  const [indemnityAccepted, setIndemnityAccepted] = useState(false);
  const [created, setCreated] = useState<RegistrationCreateResponse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"PAYNOW" | "BANK_TRANSFER">("PAYNOW");
  const [transactionId, setTransactionId] = useState("");
  const [proofFileUrl, setProofFileUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const shirtPrice = event?.shirtPrice ?? 35;
  const shirtType = event?.shirtSizes?.[0]?.type ?? "adult";

  useEffect(() => {
    getCurrentEvent()
      .then(async (current) => {
        setEvent(current);
        const loadedCategories = await getCategories(current.id);
        setCategories(loadedCategories);
        const defaultCategoryId = loadedCategories[0]?.id ?? 0;
        setParticipants([emptyParticipant(defaultCategoryId)]);
      })
      .catch(() => setError("Start the backend to submit a real registration."));
  }, []);

  const total = useMemo(() => {
    const shirts = participants.reduce((sum, participant) => sum + Number(participant.tshirtQty || 0) * shirtPrice, 0);
    return shirts + Number(donationAmount || 0) * 100;
  }, [donationAmount, participants, shirtPrice]);

  function updateParticipant(index: number, patch: Partial<ParticipantForm>) {
    setParticipants((current) => current.map((participant, currentIndex) => (currentIndex === index ? { ...participant, ...patch } : participant)));
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
    if (!participants.length) return "Please add at least one participant.";
    const missingCategoryIndex = participants.findIndex((participant) => !participant.categoryId);
    if (missingCategoryIndex >= 0) return `Please choose a category for participant ${missingCategoryIndex + 1}.`;
    const negativeShirtIndex = participants.findIndex((participant) => Number(participant.tshirtQty || 0) < 0);
    if (negativeShirtIndex >= 0) return `T-shirt quantity cannot be negative for participant ${negativeShirtIndex + 1}.`;
    if (Number(donationAmount || 0) < 0) return "Donation amount cannot be negative.";
    if (!indemnityAccepted) return "Please accept the indemnity and PDPA consent before checkout.";
    return "";
  }

  function toParticipantInput(participant: ParticipantForm, index: number): ParticipantInput {
    const fallbackName = index === 0 ? payer.name : `Guest ${index + 1}`;
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
        participants: participants.map(toParticipantInput),
        donationAmount: Number(donationAmount || 0) * 100,
        extraShirts: [],
        indemnityAccepted,
      });
      window.localStorage.setItem("lastRegistrationId", String(response.registrationId));
      setCreated(response);
      setMessage("Registration created. Please complete your PayNow or bank-transfer payment.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    }
  }

  async function handleSubmitPayment() {
    if (!created) return;
    if (!transactionId.trim()) {
      setError("Please enter the transaction ID or payment reference before submitting.");
      return;
    }
    setError("");
    try {
      await submitPayment(created.registrationId, {
        method: paymentMethod,
        userTransactionId: transactionId,
        proofFileUrl: proofFileUrl || undefined,
      });
      router.push(`/confirmation?registrationId=${created.registrationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment submission failed.");
    }
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
      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Stack spacing={2}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5">Payer details</Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Name" value={payer.name} onChange={(e) => setPayer({ ...payer, name: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email address" value={payer.email} onChange={(e) => setPayer({ ...payer, email: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="NRIC / Passport / FIN" value={payer.identity} onChange={(e) => setPayer({ ...payer, identity: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Blood type" value={payer.bloodType} onChange={(e) => setPayer({ ...payer, bloodType: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Address in Singapore" value={payer.address} onChange={(e) => setPayer({ ...payer, address: e.target.value })} />
                </Grid>
              </Grid>
            </Paper>
            <Paper sx={{ p: 3 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} justifyContent="space-between">
                <Box>
                  <Typography variant="h5">Participants</Typography>
                  <Typography color="text.secondary">Category is required per participant. Name, email, and phone can stay light for added participants.</Typography>
                </Box>
                <Button variant="outlined" onClick={() => setParticipants([...participants, emptyParticipant(categories[0]?.id ?? 0)])}>
                  Add participant
                </Button>
              </Stack>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {participants.map((participant, index) => (
                  <Box key={index} sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2 }}>
                    <Typography fontWeight={800} sx={{ mb: 2 }}>
                      Participant {index + 1}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Name" value={participant.name} onChange={(e) => updateParticipant(index, { name: e.target.value })} />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Email" value={participant.email} onChange={(e) => updateParticipant(index, { email: e.target.value })} />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Phone" value={participant.phone} onChange={(e) => updateParticipant(index, { phone: e.target.value })} />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
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
                      <Grid item xs={6} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>T-shirt size</InputLabel>
                          <Select label="T-shirt size" value={participant.tshirtSize} onChange={(e) => updateParticipant(index, { tshirtSize: e.target.value })}>
                            {sizes.map((size) => (
                              <MenuItem key={size} value={size}>
                                {size}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
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
                label="I agree to the indemnity and PDPA consent wording for this event."
              />
              <Button fullWidth variant="contained" size="large" sx={{ mt: 2 }} disabled={!indemnityAccepted || !event} onClick={handleCreateRegistration}>
                Continue to payment
              </Button>
            </Paper>
            {created ? (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5">Checkout</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Use reference <strong>{created.generatedPaymentReference}</strong> in the payment comments so admin can match your transfer.
                </Typography>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Payment method</InputLabel>
                  <Select label="Payment method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as "PAYNOW" | "BANK_TRANSFER")}>
                    <MenuItem value="PAYNOW">PayNow</MenuItem>
                    <MenuItem value="BANK_TRANSFER">Bank transfer</MenuItem>
                  </Select>
                </FormControl>
                <TextField fullWidth label="Transaction ID / payment comment" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} sx={{ mt: 2 }} />
                <TextField fullWidth label="Proof URL or note" value={proofFileUrl} onChange={(e) => setProofFileUrl(e.target.value)} sx={{ mt: 2 }} />
                <Button fullWidth variant="contained" sx={{ mt: 2 }} disabled={!transactionId} onClick={handleSubmitPayment}>
                  I have paid
                </Button>
                <Button component={Link} href={`/dashboard?registrationId=${created.registrationId}`} fullWidth sx={{ mt: 1 }}>
                  View My Events
                </Button>
              </Paper>
            ) : null}
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
