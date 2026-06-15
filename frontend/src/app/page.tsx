"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
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
    blurb: "Join the Terry Fox Run Singapore community in support of cancer research.",
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
  const currentEventDetails = useMemo(() => {
    if (!event) return [];
    return [
      {
        icon: <CalendarMonthIcon color="primary" />,
        label: "Current event",
        value: `${event.name}, ${event.year}`,
        helper: formatDate(event.eventStart),
      },
      {
        icon: <LocationOnIcon color="primary" />,
        label: "Venue",
        value: event.locationEvent ?? "Venue to be confirmed",
        helper: event.locationPickup ? `Pickup: ${event.locationPickup}` : "Pickup details will be announced here.",
      },
      {
        icon: <AccessTimeIcon color="primary" />,
        label: "Registration and pickup",
        value: event.registrationClose ? `Register by ${formatDate(event.registrationClose)}` : "Registration details to be confirmed",
        helper: event.pickupStart ? `Pickup starts ${formatDate(event.pickupStart)}` : "Pickup timing to be confirmed",
      },
    ];
  }, [event]);

  return (
    <Stack spacing={4}>
      {error ? <Chip color="warning" label={error} sx={{ alignSelf: "flex-start" }} /> : null}
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
              ? `linear-gradient(90deg, rgba(16,35,61,.88), rgba(16,35,61,.3)), url(${currentSlide.imageUrl}) center/cover`
              : "linear-gradient(135deg, #10233d 0%, #10233d 54%, #c91f2e 54%, #c91f2e 72%, #f6d9c7 72%)",
          }}
        />
        <Box sx={{ position: "relative", maxWidth: 760 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: 40, md: 68 }, lineHeight: 1 }}>
            {event ? `${event.name}, ${event.year}` : "Terry Fox Run Singapore"}
          </Typography>
          <Typography variant="h6" sx={{ mt: 3, maxWidth: 620, color: "rgba(255,255,255,.9)" }}>
            {currentSlide.blurb}
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
        <Stack direction="row" spacing={1} sx={{ position: "relative", mt: 3 }}>
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
                bgcolor: index === activeSlide ? "#c91f2e" : "rgba(255,255,255,.6)",
              }}
            />
          ))}
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4">Current Event</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Everything you need for this year&apos;s Terry Fox Run Singapore.
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {currentEventDetails.map((item) => (
              <Grid item xs={12} md={4} key={item.label}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ p: 2, border: "1px solid #e2e6ef", borderRadius: 2, minHeight: 118 }}>
                  {item.icon}
                  <Box>
                    <Typography fontWeight={800}>{item.label}</Typography>
                    <Typography sx={{ mt: 0.25 }}>{item.value}</Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                      {item.helper}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button component={Link} href="/register" variant="contained" size="large">
              Register now
            </Button>
            <Button component={Link} href="/event" variant="outlined" size="large">
              View event details
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
