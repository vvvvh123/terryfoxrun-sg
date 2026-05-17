"use client";

import Link from "next/link";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/GridLegacy";

const firstImages = [
  { src: "/terrys-story/terry-road-van.jpg", alt: "Terry Fox running with a support vehicle behind him" },
  { src: "/terrys-story/terry-rain-road.jpg", alt: "Terry Fox running on a rainy road" },
  { src: "/terrys-story/terry-quote.jpg", alt: "Terry Fox quote about setting an example that would never be forgotten" },
];

const secondImages = [
  { src: "/terrys-story/singapore-group.jpg", alt: "Terry Fox Run Singapore group photo" },
  { src: "/terrys-story/singapore-cyclists.jpg", alt: "Terry Fox Run Singapore participants with bicycles" },
];

function ImageCard({ alt, src }: { alt: string; src: string }) {
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      sx={{
        width: "100%",
        height: "auto",
        objectFit: "contain",
        display: "block",
        borderRadius: 2,
        border: "1px solid #e2e6ef",
        bgcolor: "white",
      }}
    />
  );
}

export default function TerrysStoryPage() {
  return (
    <Stack spacing={4}>
      <Paper
        sx={{
          p: { xs: 3, md: 6 },
          bgcolor: "#10233d",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(16,35,61,.96) 0%, rgba(16,35,61,.86) 58%, rgba(201,31,46,.92) 58%)",
          }}
        />
        <Box sx={{ position: "relative", maxWidth: 900 }}>
          <Chip label="Terry's Story" sx={{ bgcolor: "white", color: "#10233d", fontWeight: 800, mb: 3 }} />
          <Typography variant="h2" sx={{ fontSize: { xs: 40, md: 68 }, lineHeight: 1 }}>
            One run inspired a movement.
          </Typography>
          <Typography variant="h6" sx={{ mt: 3, color: "rgba(255,255,255,.88)", maxWidth: 760 }}>
            Terry Fox&apos;s Marathon of Hope remains the heart of every Terry Fox Run, including the Singapore run held more than 13,000 kilometers from where his journey began.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 4 }}>
            <Button component={Link} href="/register" variant="contained" size="large" sx={{ bgcolor: "#c91f2e" }}>
              Register
            </Button>
            <Button component={Link} href="/event" variant="outlined" size="large" sx={{ color: "white", borderColor: "white" }}>
              View event details
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Grid container spacing={2}>
        {firstImages.map((image) => (
          <Grid item xs={12} md={4} key={image.src}>
            <ImageCard {...image} />
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={2}>
          <Typography variant="h4">The Marathon of Hope</Typography>
          <Typography color="text.secondary">
            Terry&apos;s story was simple but powerful. Terry Fox lost his leg to osteogenic sarcoma at age 18, underwent 16 months of treatment, and found he could not ignore the suffering he witnessed in the cancer wards.
          </Typography>
          <Typography color="text.secondary">
            Terry decided to run across Canada to raise money for cancer research in a Marathon of Hope. He was not doing the run to become famous; he wanted to create change and fund a cure for all cancers.
          </Typography>
          <Typography color="text.secondary">
            Terry ran close to 42 kilometres, or 26 miles, a day across Canada through snow, rain, wind, heat, and humidity. He stopped in more than 400 towns, schools, and cities to talk about why he was running.
          </Typography>
          <Typography color="text.secondary">
            He started at 4:30am and often did not finish his last mile until 7pm. Sometimes Terry and Doug, his best friend and driver, would sleep in the van because they could not afford a place to stay.
          </Typography>
          <Typography color="text.secondary">
            Some days hundreds of people cheered him on; other days he was alone on the road, and no money was raised. But Terry never gave up hope. The only thing that could have stopped Terry from reaching the Pacific Ocean did: cancer returned in his lungs, and he was forced to stop on September 1, 1980 after having run 5,373 kilometres.
          </Typography>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        {secondImages.map((image) => (
          <Grid item xs={12} md={6} key={image.src}>
            <ImageCard {...image} />
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={2}>
          <Typography variant="h4">A Legacy In Singapore</Typography>
          <Typography color="text.secondary">
            Before his death on June 28, 1981, Terry had achieved his once unimaginable goal of $1 from every Canadian. More importantly, he had set in motion the framework for an event, The Terry Fox Run, that would ignite cancer research in Canada, raising more than $850 million since 1980, and bring hope and health to millions of Canadians.
          </Typography>
          <Typography color="text.secondary">
            Today, in Singapore, over 13,000 kilometres away from the start of the Marathon of Hope, Terry&apos;s story is alive and well in the Little Red Dot.
          </Typography>
          <Typography color="text.secondary">
            The Terry Fox Run Singapore Committee is excited to celebrate the 17th anniversary of Terry Fox Run Singapore this year and looks forward to welcoming you, your family and friends, colleagues, pets, and strollers as we all raise funds for cancer research in Singapore.
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
}
