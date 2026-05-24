"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import { EventDto, SlideshowImage, getCurrentEvent, getSlideshow } from "@/lib/api";

const fallbackSlides: SlideshowImage[] = [
  {
    imageUrl: "",
    blurb: "Terry Fox's Marathon of Hope remains the heart of the run.",
    displayOrder: 1,
    active: true,
  },
  {
    imageUrl: "",
    blurb: "Past Singapore runs bring families, schools, and companies together for cancer research.",
    displayOrder: 2,
    active: true,
  },
  {
    imageUrl: "",
    blurb: "A simple mobile-friendly registration flow keeps the focus on participation and giving.",
    displayOrder: 3,
    active: true,
  },
];

function formatDate(value?: string) {
  if (!value) return "Date to be confirmed";
  return new Intl.DateTimeFormat("en-SG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function Home() {
  const [event, setEvent] = useState<EventDto | null>(null);
  const [slides, setSlides] = useState<SlideshowImage[]>(fallbackSlides);
  const [activeSlide, setActiveSlide] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    getCurrentEvent()
      .then(async (current) => {
        setEvent(current);
        const configuredSlides = await getSlideshow(current.id);
        if (configuredSlides.length > 0) {
          setSlides(configuredSlides);
        }
      })
      .catch(() => setError("We could not load the latest event details. Please try again later."));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const currentSlide = slides[activeSlide] ?? fallbackSlides[0];
  const donationPresets = useMemo(() => event?.donationPresets ?? [25, 50, 100], [event]);

  return (
    <Stack spacing={4}>
      {error ? <Chip color="warning" label={error} sx={{ alignSelf: "flex-start" }} /> : null}
      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} lg={7}>
          <Paper
            sx={{
              minHeight: { xs: 520, md: 620 },
              p: { xs: 3, md: 5 },
              color: "white",
              bgcolor: "#10233d",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: currentSlide.imageUrl
                  ? `linear-gradient(90deg, rgba(16,35,61,.88), rgba(16,35,61,.35)), url(${currentSlide.imageUrl}) center/cover`
                  : "linear-gradient(135deg, #10233d 0%, #10233d 54%, #c91f2e 54%, #c91f2e 72%, #f6d9c7 72%)",
              }}
            />
            <Box sx={{ position: "relative", maxWidth: 720 }}>
              <Chip label="Build once, re-use every year" sx={{ bgcolor: "white", color: "#10233d", fontWeight: 800, mb: 3 }} />
              <Typography variant="h2" sx={{ fontSize: { xs: 40, md: 68 }, lineHeight: 1 }}>
                {event ? `${event.name}, ${event.year}` : "Terry Fox Run Singapore"}
              </Typography>
              <Typography variant="h6" sx={{ mt: 3, maxWidth: 620, color: "rgba(255,255,255,.88)" }}>
                A mobile-friendly event website for registration, donations, T-shirt pickup, yearly history, and
                admin operations.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 4 }}>
                <Button component={Link} href="/register" variant="contained" size="large" sx={{ bgcolor: "#c91f2e" }}>
                  Register now
                </Button>
                <Button component={Link} href="/event" variant="outlined" size="large" sx={{ color: "white", borderColor: "white" }}>
                  View event details
                </Button>
              </Stack>
            </Box>
            <Paper sx={{ position: "relative", p: 2, bgcolor: "rgba(255,255,255,.92)", color: "#10233d", maxWidth: 720 }}>
              <Typography fontWeight={800}>Rotating homepage slideshow</Typography>
              <Typography color="text.secondary">{currentSlide.blurb}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                {slides.map((slide, index) => (
                  <Box
                    key={`${slide.displayOrder}-${index}`}
                    component="button"
                    aria-label={`Show slide ${index + 1}`}
                    onClick={() => setActiveSlide(index)}
                    sx={{
                      width: index === activeSlide ? 30 : 10,
                      height: 10,
                      border: 0,
                      borderRadius: 999,
                      bgcolor: index === activeSlide ? "#c91f2e" : "#aab4c3",
                    }}
                  />
                ))}
              </Stack>
            </Paper>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Stack spacing={2} sx={{ height: "100%" }}>
            <Paper sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CalendarMonthIcon color="primary" />
                  <Box>
                    <Typography fontWeight={800}>Current event</Typography>
                    {event ? <Typography>{event.name}, {event.year}</Typography> : null}
                    <Typography color="text.secondary">{formatDate(event?.eventStart)}</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <LocationOnIcon color="primary" />
                  <Box>
                    <Typography fontWeight={800}>Venue</Typography>
                    <Typography color="text.secondary">{event?.locationEvent ?? "Venue to be confirmed"}</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <VolunteerActivismIcon color="primary" />
                  <Box>
                    <Typography fontWeight={800}>Donation presets</Typography>
                    <Typography color="text.secondary">{donationPresets.map((amount) => `$${amount}`).join(" / ")}</Typography>
                  </Box>
                </Stack>
              </Stack>
            </Paper>
            <Paper sx={{ p: 3, flexGrow: 1 }}>
              <Typography variant="h5">Website highlights</Typography>
              <Grid container spacing={1.5} sx={{ mt: 1 }}>
                {[
                  "Mobile-first registration",
                  "PayNow and bank transfer",
                  "Manual payment verification",
                  "Configurable slideshow blurbs",
                  "Past event and transaction history",
                  "Admin mass email foundation",
                ].map((item) => (
                  <Grid item xs={12} sm={6} key={item}>
                    <Box sx={{ p: 1.5, border: "1px solid #e2e6ef", borderRadius: 2, minHeight: 72 }}>
                      <Typography fontWeight={700}>{item}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
