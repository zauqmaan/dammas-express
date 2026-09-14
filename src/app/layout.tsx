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
  // The homepage's own canonical. Every other public route sets its own via
  // pageMetadata() in src/lib/seo.ts.
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: BUSINESS.name,
    locale: "en_AE",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
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
