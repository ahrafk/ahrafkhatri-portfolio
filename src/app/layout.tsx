import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Nav } from "@/components/layout/nav";
import { MotionProvider } from "@/components/providers/motion-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { site, SITE_URL } from "@/content/site";
import "./globals.css";

// If the build machine is offline, swap this for `GeistMono` from "geist/font/mono".
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: site.homeTitle, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: SITE_URL }],
  creator: site.name,
  keywords: [...site.keywords],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1020" },
  ],
};

/** Keeps content that starts hidden (for entrance animation) visible when JavaScript is off. */
const NOSCRIPT_CSS = "[data-reveal]{opacity:1!important;transform:none!important}";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <noscript>
          <style>{NOSCRIPT_CSS}</style>
        </noscript>
        <a
          href="#main"
          className="sr-only rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <MotionProvider>
            <Nav />
            <main id="main">{children}</main>
            <Footer />
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
