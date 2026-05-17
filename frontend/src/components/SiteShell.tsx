"use client";

import Link from "next/link";
import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from "@mui/material";
import { useAuth } from "@/components/AuthProvider";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const { appRole, loading, signOut, user } = useAuth();
  const navItems = [
    { href: "/event", label: "Event" },
    { href: "/terrys-story", label: "Terry's Story" },
    { href: "/register", label: "Register" },
    { href: "/corporate", label: "Corporate" },
    { href: "/dashboard", label: "My Events" },
    { href: "/contact", label: "Contact Us" },
    ...(appRole === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f7fb" }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#10233d", color: "white", borderBottom: "1px solid rgba(255,255,255,.16)" }}>
        <Toolbar sx={{ gap: 2, minHeight: 72 }}>
          <Typography
            component={Link}
            href="/"
            variant="h6"
            sx={{ color: "white", textDecoration: "none", fontWeight: 800, flexGrow: 1 }}
          >
            Terry Fox Run Singapore
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", md: "flex" } }}>
            {navItems.map((item) => (
              <Button key={item.href} component={Link} href={item.href} color="inherit" size="small" sx={{ color: "white" }}>
                {item.label}
              </Button>
            ))}
            <Button component="a" href="https://instagram.com/terryfoxrunsingapore/" target="_blank" rel="noreferrer" color="inherit" size="small" sx={{ minWidth: 36, color: "white" }} aria-label="Instagram">
              <Box component="img" src="/ig_logo.jpg" alt="" sx={{ width: 22, height: 22, objectFit: "contain", borderRadius: "50%" }} />
            </Button>
            <Button component="a" href="https://www.facebook.com/Terry-Fox-Run-Singapore-509827395766103/" target="_blank" rel="noreferrer" color="inherit" size="small" sx={{ minWidth: 36, color: "white" }} aria-label="Facebook">
              <Box component="img" src="/fb_logo.jpg" alt="" sx={{ width: 22, height: 22, objectFit: "contain", borderRadius: "50%" }} />
            </Button>
          </Stack>
          {user ? (
            <Button onClick={() => signOut()} variant="outlined" color="inherit" sx={{ color: "white", borderColor: "rgba(255,255,255,.65)" }}>
              Sign out
            </Button>
          ) : (
            <Button component={Link} href="/login" variant="outlined" color="inherit" disabled={loading} sx={{ color: "white", borderColor: "rgba(255,255,255,.65)" }}>
              Sign in
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
        {children}
      </Container>
    </Box>
  );
}
