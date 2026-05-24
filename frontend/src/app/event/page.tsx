"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { CategoryDto, EventDto, getCategories, getCurrentEvent } from "@/lib/api";

function formatDate(value?: string) {
  if (!value) return "To be confirmed";
  return new Intl.DateTimeFormat("en-SG", { dateStyle: "full", timeStyle: "short" }).format(new Date(value));
}

function EventImage({ src, alt }: { src?: string; alt: string }) {
  if (!src) return null;
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      sx={{
        width: "100%",
        maxHeight: 360,
        objectFit: "contain",
        bgcolor: "white",
        border: "1px solid #e2e6ef",
        borderRadius: 2,
        p: 1,
      }}
    />
  );
}

export default function EventPage() {
  const [event, setEvent] = useState<EventDto | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getCurrentEvent()
      .then(async (current) => {
        setEvent(current);
        setCategories(await getCategories(current.id));
      })
      .catch(() => setError("We could not load the latest event details. Please try again later."));
  }, []);

  const title = event ? `${event.name}, ${event.year}` : "Terry Fox Run Singapore";
  const details = event?.eventDetails;
  const activeFaqs = useMemo(() => (event?.faqs ?? []).filter((faq) => faq.active).sort((a, b) => a.displayOrder - b.displayOrder), [event]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">{title}</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 860 }}>
          Full run details, T-shirt collection information, FAQ, and registration links for this year&apos;s event.
        </Typography>
      </Box>
      {error ? <Alert severity="warning">{error}</Alert> : null}

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h4">Event overview</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography fontWeight={800}>Run date and time</Typography>
                <Typography color="text.secondary">{formatDate(event?.eventStart)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography fontWeight={800}>Venue</Typography>
                <Typography color="text.secondary">{event?.locationEvent ?? "Venue to be confirmed"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography fontWeight={800}>Registration closes</Typography>
                <Typography color="text.secondary">{formatDate(event?.registrationClose)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography fontWeight={800}>T-shirt pickup</Typography>
                <Typography color="text.secondary">
                  {event?.locationPickup ?? "Pickup venue to be confirmed"} · {formatDate(event?.pickupStart)}
                </Typography>
              </Grid>
            </Grid>
            {details?.scheduleSummary ? <Typography sx={{ mt: 3 }}>{details.scheduleSummary}</Typography> : null}
            {details?.routeNotes ? <Typography color="text.secondary" sx={{ mt: 1 }}>{details.routeNotes}</Typography> : null}
            <Button component={Link} href="/register" variant="contained" size="large" sx={{ mt: 4 }}>
              Register for this event
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h5">Categories</Typography>
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {(categories.length ? categories : [{ id: 0, eventId: 0, name: "5K / 10K Fun Run", isActive: true }]).map((category) => (
                <Box key={category.id} sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2 }}>
                  <Typography fontWeight={800}>{category.name}</Typography>
                  <Typography color="text.secondary">{category.description ?? "Participant category configured by admin."}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={5}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <EventImage src={details?.tshirtFrontImageUrl} alt="T-shirt front design" />
              <EventImage src={details?.tshirtBackImageUrl} alt="T-shirt back design" />
            </Stack>
          </Grid>
          <Grid item xs={12} md={7}>
            <Typography variant="h4">{details?.tshirtTitle ?? `${event?.year ?? ""} Terry Fox Run T-Shirt`}</Typography>
            <Typography sx={{ mt: 2, whiteSpace: "pre-line" }}>
              {details?.tshirtDescription ?? "Limited-edition event T-shirt details will be confirmed by the committee."}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ sm: "center" }}>
          <Typography variant="h4">FAQ</Typography>
          <Chip label={`${activeFaqs.length} questions`} />
        </Stack>
        <Stack spacing={1} sx={{ mt: 2 }}>
          {activeFaqs.map((faq, index) => (
            <Accordion key={`${faq.question}-${index}`} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={800}>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary" sx={{ whiteSpace: "pre-line" }}>{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
          {!activeFaqs.length ? <Typography color="text.secondary">FAQ will be published once event details are confirmed.</Typography> : null}
        </Stack>
      </Paper>
    </Stack>
  );
}
