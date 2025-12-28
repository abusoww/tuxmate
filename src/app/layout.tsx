import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/hooks/useTheme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TuxMate - Linux App Installer Command Generator",
  description: "TuxMate helps you generate terminal commands to install your favorite apps on any Linux distribution. Select your distro, pick your apps, and get your install command.",
  openGraph: {
    title: "TuxMate - Linux App Installer",
    description: "Generate install commands for 180+ apps on Ubuntu, Debian, Arch, Fedora, and more.",
    type: "website",
    url: "https://tuxmate.abusov.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "TuxMate - Linux App Installer",
    description: "Generate install commands for 180+ apps on any Linux distro.",
  },
};

// Script to run before React hydrates to prevent theme flash
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      if (theme === 'light' || !theme) {
        document.documentElement.classList.add('light');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const umamiId = process.env.NEXT_PUBLIC_UMAMI_ID;
  const cfBeacon = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {umamiId && (
          <script defer src="https://cloud.umami.is/script.js" data-website-id={umamiId} />
        )}
        {cfBeacon && (
          <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={`{"token": "${cfBeacon}"}`} />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
