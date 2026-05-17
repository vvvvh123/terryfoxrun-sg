"use client";

import Link from "next/link";
import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from "@mui/material";
import { useAuth } from "@/components/AuthProvider";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const { appRole, loading, signOut, user } = useAuth();
  const navItems = [
    { href: "/event", label: "Event" },
    { href: "/register", label: "Register" },
    { href: "/corporate", label: "Corporate" },
    { href: "/dashboard", label: "My Events" },
    ...(appRole === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f7fb" }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: "1px solid #e2e6ef" }}>
        <Toolbar sx={{ gap: 2, minHeight: 72 }}>
          <Typography
            component={Link}
            href="/"
            variant="h6"
            sx={{ color: "#10233d", textDecoration: "none", fontWeight: 800, flexGrow: 1 }}
          >
            Terry Fox Run Singapore
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", md: "flex" } }}>
            {navItems.map((item) => (
              <Button key={item.href} component={Link} href={item.href} color="inherit" size="small">
                {item.label}
              </Button>
            ))}
          </Stack>
          {user ? (
            <Button onClick={() => signOut()} variant="outlined" color="inherit">
              Sign out
            </Button>
          ) : (
            <Button component={Link} href="/login" variant="outlined" color="inherit" disabled={loading}>
              Sign in
            </Button>
          )}
          <Button component={Link} href="/register" variant="contained" sx={{ bgcolor: "#c91f2e" }}>
            Register
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
        {children}
      </Container>
    </Box>
  );
}
