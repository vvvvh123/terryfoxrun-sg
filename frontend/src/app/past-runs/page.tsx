"use client";

import { Box, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/GridLegacy";

const pastRuns = [
  { year: "2025", title: "Angsana Green, East Coast Park", note: "Event history, gallery links, and transaction records remain available year to year." },
  { year: "2024", title: "Singapore community run", note: "Past run pages can keep photos, sponsors, highlights, and committee notes together." },
  { year: "2023", title: "Archive placeholder", note: "Admin can expand this archive as historical material is gathered." },
];

export default function PastRunsPage() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">Past Runs</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          The site is designed to build once and re-use every year, preserving public event history and internal transaction records.
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {pastRuns.map((run) => (
          <Grid item xs={12} md={4} key={run.year}>
            <Paper sx={{ p: 3, minHeight: 210 }}>
              <Typography variant="h3" color="primary">{run.year}</Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>{run.title}</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>{run.note}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
