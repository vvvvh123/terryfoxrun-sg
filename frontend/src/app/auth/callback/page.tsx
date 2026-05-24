"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Stack, Typography } from "@mui/material";
import { supabase } from "@/lib/supabase";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    async function finishSignIn() {
      const code = searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
      }
      router.replace(searchParams.get("next") ?? "/dashboard");
    }

    finishSignIn();
  }, [router, searchParams]);

  return (
    <Stack spacing={2}>
      <Typography variant="h3">Signing you in...</Typography>
      {error ? <Alert severity="warning">{error}</Alert> : null}
    </Stack>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Typography>Signing you in...</Typography>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
