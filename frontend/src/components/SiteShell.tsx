"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Alert, AppBar, Box, Button, Container, Snackbar, Stack, Toolbar, Typography } from "@mui/material";
import { useAuth } from "@/components/AuthProvider";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { appRole, loading, signOut, user } = useAuth();
  const [authNotice, setAuthNotice] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get("auth");
    if (auth === "signed-in") {
      setAuthNotice("Successfully signed in.");
    } else if (auth === "signed-out") {
      setAuthNotice("Successfully signed out.");
    }
    if (auth) {
      params.delete("auth");
      const query = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
    }
  }, [pathname]);

  async function handleSignOut() {
    await signOut();
    window.location.assign("/?auth=signed-out");
  }

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/terrys-story", label: "Terry's Story" },
    { href: "/event", label: "Event" },
    { href: "/register", label: "Register" },
    { href: "/corporate", label: "Corporate" },
    { href: "/dashboard", label: "My Events" },
    { href: "/contact", label: "Contact Us" },
    ...(appRole === "admin" || appRole === "volunteer" ? [{ href: "/volunteer", label: "Volunteer" }] : []),
    ...(appRole === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f7fb" }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#10233d", color: "white", borderBottom: "1px solid rgba(255,255,255,.16)" }}>
        <Toolbar sx={{ gap: 2, minHeight: 72 }}>
          <Stack
            component={Link}
            href="/"
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{ color: "white", textDecoration: "none", fontWeight: 800, flexGrow: 1, minWidth: 0 }}
          >
            <Box component="img" src="/terry_fox_logo.png" alt="Terry Fox Run Singapore logo" sx={{ width: 38, height: 38, objectFit: "contain", flexShrink: 0 }} />
            <Typography variant="h6" sx={{ color: "white", fontWeight: 800, lineHeight: 1.1 }}>
              Terry Fox Run Singapore
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", md: "flex" } }}>
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  color="inherit"
                  size="small"
                  aria-current={active ? "page" : undefined}
                  sx={{ color: active ? "#c91f2e" : "white", fontWeight: active ? 800 : 600 }}
                >
                  {item.label}
                </Button>
              );
            })}
            <Button component="a" href="https://instagram.com/terryfoxrunsingapore/" target="_blank" rel="noreferrer" color="inherit" size="small" sx={{ minWidth: 36, color: "white" }} aria-label="Instagram">
              <Box component="img" src="/ig_logo.jpg" alt="" sx={{ width: 22, height: 22, objectFit: "contain", borderRadius: "50%" }} />
            </Button>
            <Button component="a" href="https://www.facebook.com/Terry-Fox-Run-Singapore-509827395766103/" target="_blank" rel="noreferrer" color="inherit" size="small" sx={{ minWidth: 36, color: "white" }} aria-label="Facebook">
              <Box component="img" src="/fb_logo.jpg" alt="" sx={{ width: 22, height: 22, objectFit: "contain", borderRadius: "50%" }} />
            </Button>
          </Stack>
          {user ? (
            <Button onClick={handleSignOut} variant="outlined" color="inherit" sx={{ color: "white", borderColor: "rgba(255,255,255,.65)" }}>
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
      <Snackbar
        open={Boolean(authNotice)}
        autoHideDuration={4000}
        onClose={() => setAuthNotice("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setAuthNotice("")}>
          {authNotice}
        </Alert>
      </Snackbar>
    </Box>
  );
}
