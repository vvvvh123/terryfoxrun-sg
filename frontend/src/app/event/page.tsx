"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { CategoryDto, EventDto, getCategories, getCurrentEvent } from "@/lib/api";

function formatDate(value?: string) {
  if (!value) return "To be confirmed";
  return new Intl.DateTimeFormat("en-SG", { dateStyle: "full", timeStyle: "short" }).format(new Date(value));
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
      .catch(() => setError("Start the backend to load live event details."));
  }, []);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">Current Event</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 820 }}>
          The homepage gives the overview; this page carries the full run details participants need before registering.
        </Typography>
      </Box>
      {error ? <Chip color="warning" label={error} sx={{ alignSelf: "flex-start" }} /> : null}
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h4">{event?.name ?? "Terry Fox Run Singapore"}</Typography>
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Box>
                <Typography fontWeight={800}>Run date and time</Typography>
                <Typography color="text.secondary">{formatDate(event?.eventStart)}</Typography>
              </Box>
              <Box>
                <Typography fontWeight={800}>Venue</Typography>
                <Typography color="text.secondary">{event?.locationEvent ?? "Venue to be confirmed"}</Typography>
              </Box>
              <Box>
                <Typography fontWeight={800}>Registration closes</Typography>
                <Typography color="text.secondary">{formatDate(event?.registrationClose)}</Typography>
              </Box>
              <Box>
                <Typography fontWeight={800}>T-shirt pickup</Typography>
                <Typography color="text.secondary">
                  {event?.locationPickup ?? "Pickup venue to be confirmed"} · {formatDate(event?.pickupStart)}
                </Typography>
              </Box>
            </Stack>
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
    </Stack>
  );
}
