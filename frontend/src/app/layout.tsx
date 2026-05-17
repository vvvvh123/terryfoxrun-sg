import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";
import SiteShell from "@/components/SiteShell";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Terry Fox Run Singapore",
  description: "Registration and event information for Terry Fox Run Singapore.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <AuthProvider>
            <SiteShell>{children}</SiteShell>
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
