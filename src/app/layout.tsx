import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dammasexpress.ae"),
  title: {
    default: "Al Quoz Car Lift Services & Staff Transport Service | Dammas Express",
    template: "%s | Dammas Express",
  },
  description:
    "Affordable car lift services to Al Quoz from Deira, Bur Dubai, Karama, Rigga & Abuhail. Monthly passes for AED 250-300. Morning & Evening shifts available.",
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
  openGraph: {
    url: "https://dammasexpress.ae",
    title: "Al Quoz Car Lift Services | Dammas Express",
    description:
      "Daily and monthly car lift services to Al Quoz. Starting from AED 250/month.",
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
