import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dammas-express.com"), // Replace with actual domain later
  title: {
    default: "DAMMAS EXPRESS | Professional Car Lift Services in Dubai",
    template: "%s | DAMMAS EXPRESS",
  },
  description:
    "Reliable, safe, and affordable car lift services across Dubai and UAE. Daily rides, monthly subscriptions, airport transfers, and corporate transport. 24/7 available.",
  keywords: [
    "car lift dubai",
    "transportation services dubai",
    "car lift uae",
    "dubai to sharjah transport",
    "monthly car lift subscription",
    "airport transfer dubai",
    "staff transport dubai",
    "toyota hiace rental dubai",
  ],
  authors: [{ name: "DAMMAS EXPRESS" }],
  openGraph: {
    type: "website",
    locale: "en_AE",
    url: "https://dammas-express.com",
    siteName: "DAMMAS EXPRESS",
    title: "DAMMAS EXPRESS | Professional Car Lift Services in Dubai",
    description:
      "Reliable, safe, and affordable car lift services across Dubai and UAE. 24/7 available.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DAMMAS EXPRESS | Car Lift Services Dubai",
    description:
      "Reliable, safe, and affordable car lift services across Dubai and UAE.",
  },
  robots: {
    index: true,
    follow: true,
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
        {children}
      </body>
    </html>
  );
}
