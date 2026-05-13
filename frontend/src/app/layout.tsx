import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";
import SiteShell from "@/components/SiteShell";

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
          <SiteShell>{children}</SiteShell>
        </ThemeRegistry>
      </body>
    </html>
  );
}
