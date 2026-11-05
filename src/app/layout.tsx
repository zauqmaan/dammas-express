import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import DamasExpressJsonLd from "@/components/seo/JsonLd";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import {
  BRAND_SUFFIX,
  BUSINESS,
  HOME_DESCRIPTION,
  HOME_TITLE,
  OG_IMAGE,
  SITE_URL,
} from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // 58 chars — inside the ~60 the SERP shows on a narrow phone, with the
    // distinctive words ("Al Quoz Car Lift") first so they survive truncation.
    default: HOME_TITLE,
    template: `%s${BRAND_SUFFIX}`,
  },
  description: HOME_DESCRIPTION,
  keywords: [
    "al quoz car lift",
    "car lift to al quoz",
    "deira to al quoz",
    "bur dubai to al quoz",
    "karama to al quoz transport",
    "monthly car lift dubai",
    "al quoz staff transport",
    "dammas express",
  ],
  // Only site-wide defaults belong here. No canonical, og:url or page-specific
  // OG/Twitter title: every segment inherits this object, so a homepage
  // canonical declared here was silently applied to any page that did not set
  // its own (the dashboard login and 404 pages did exactly that). The homepage
  // declares its canonical in (marketing)/page.tsx; every other public page
  // declares its own via pageMetadata() in src/lib/seo.ts.
  openGraph: {
    siteName: BUSINESS.name,
    locale: "en_AE",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE],
  },
};

export const viewport: Viewport = {
  themeColor: "#030712",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-background font-sans antialiased">
        <DamasExpressJsonLd />
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
