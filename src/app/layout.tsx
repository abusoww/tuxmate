import type { Metadata } from "next";
import { Outfit, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/hooks/useTheme";

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TuxMate - LINUX BULK APP INSTALLER",
  description: "TuxMate helps you generate terminal commands to install your favorite apps on any Linux distribution. Select your distro, pick your apps, and get your install command.",
  openGraph: {
    title: "TuxMate - Linux Bulk App Installer",
    description: "Generate install commands for 180+ apps on Ubuntu, Debian, Arch, Fedora, and more.",
    type: "website",
    url: "https://tuxmate.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "TuxMate - Linux Bulk App Installer",
    description: "Generate install commands for 180+ apps on any Linux distro.",
  },
};

// Script to run before React hydrates to prevent theme flash
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      var isDark = false;
      if (theme) {
        isDark = theme === 'dark';
      } else {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      if (!isDark) {
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
        {/* PWA manifest and meta tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        <script dangerouslySetInnerHTML={{ __html: themeScript }} />

        {/* Register service worker for offline support */}
        <script dangerouslySetInnerHTML={{
          __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(function(reg) {
                console.log('SW registered:', reg.scope);
              }).catch(function(err) {
                console.log('SW registration failed:', err);
              });
            });
          }
        `}} />

        {umamiId && (
          <script defer src="https://cloud.umami.is/script.js" data-website-id={umamiId} />
        )}
        {cfBeacon && (
          <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={`{"token": "${cfBeacon}"}`} />
        )}
      </head>
      <body
        className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
