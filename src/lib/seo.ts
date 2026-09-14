// Single source of truth for the canonical host, the business NAP, and the
// page-level metadata every public route emits.
//
// Why this file exists: the hostname used to be a hardcoded string literal in
// four files that disagreed (robots.ts said www, everything else said the
// apex), and the business address existed in three different spellings. A NAP
// mismatch between the visible page and the structured data hurts local
// ranking, so both now live here and everything else imports them.

import type { Metadata } from "next";

/**
 * Canonical origin, no trailing slash. The apex is canonical — www redirects to
 * it at the hosting layer. Override per-environment with NEXT_PUBLIC_SITE_URL
 * (e.g. a preview deployment) without touching any other file.
 */
const DEFAULT_SITE_URL = "https://dammasexpress.ae";

// A declared-but-empty env var is "", not undefined, so `??` would let a blank
// value through and produce relative "URLs" everywhere. Check for falsy.
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const SITE_URL = (configuredSiteUrl || DEFAULT_SITE_URL).replace(/\/+$/, "");

/**
 * Name, address and phone as they should appear everywhere — the footer, the
 * contact section and the LocalBusiness JSON-LD. Keep these identical to the
 * Google Business Profile: consistency is what makes the details count as
 * corroboration.
 */
export const BUSINESS = {
  name: "Dammas Express",
  legalName: "DAMMAS EXPRESS UAE",
  /** Digits-only E.164, for tel: and wa.me hrefs. */
  phone: "+971566625302",
  phoneDisplay: "+971 56 662 5302",
  whatsapp: "https://wa.me/971566625302",
  email: "ehsanch112@gmail.com",
  streetAddress: "Al Falasi Building, 2nd Floor, Office 201",
  locality: "Dubai",
  region: "Dubai",
  countryCode: "AE",
  country: "UAE",
  /** The one visible address string. Use this, never a hand-typed variant. */
  addressFull: "Al Falasi Building, 2nd Floor, Office 201, Dubai, UAE",
} as const;

/**
 * Two different things that were previously conflated across the site — one
 * page said "24/7 Available", another "Saturday to Thursday", the JSON-LD said
 * all seven days. They mean different things:
 *
 *  - `contact`  — when someone can reach us to ask or book. Always.
 *  - `service`  — when the vehicles actually run. Weekdays, two fixed windows.
 *
 * Every hours string on the site comes from here. If the schedule changes,
 * change it once in this block.
 */
export const HOURS = {
  /** Enquiries, WhatsApp and bookings. */
  contact: "24/7, all days",
  contactShort: "24/7",
  /** Days the vehicles run. */
  serviceDays: "Monday to Friday",
  serviceDaysShort: "Mon–Fri",
  morning: "7:00 AM – 10:00 AM",
  evening: "5:00 PM – 8:00 PM",
  /** One-line summary for tight spots like the footer and trust bars. */
  serviceSummary: "Rides Mon–Fri · 7–10 AM & 5–8 PM",
} as const;

/** Days the vehicles run, for the JSON-LD openingHoursSpecification. */
export const SERVICE_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

/** 24-hour times matching HOURS.morning / HOURS.evening, for structured data. */
export const SERVICE_WINDOWS = {
  morning: { opens: "07:00", closes: "10:00" },
  evening: { opens: "17:00", closes: "20:00" },
} as const;

/**
 * Social-proof numbers. Shared because these used to disagree across pages:
 * the stats bar said 50+ customers while the CTA banner said 500+, and the
 * stats bar said 5+ vehicles while the portfolio trust bar said 50+.
 * Anything claiming a count should read from here.
 */
export const SOCIAL_PROOF = {
  customers: { value: "50", suffix: "+", label: "Happy Customers" },
  vehicles: { value: "5", suffix: "+", label: "Fleet Vehicles" },
} as const;

export const BRAND_SUFFIX = ` | ${BUSINESS.name}`;

export const HOME_TITLE = `Al Quoz Car Lift & Staff Transport, Dubai${BRAND_SUFFIX}`;

export const HOME_DESCRIPTION =
  "Affordable car lift to Al Quoz from Deira, Bur Dubai, Karama, Rigga & Abuhail. Monthly passes AED 250-300. Morning & evening shifts, Monday to Friday.";

/**
 * Open Graph image. Served by the route handler at src/app/og/route.tsx, which
 * renders a 1200x630 card with next/og.
 *
 * A route handler rather than the `opengraph-image` file convention on purpose:
 * the file convention appends a content hash to the URL, so it cannot be
 * referenced from here. A fixed path means every page can declare the image
 * explicitly and we never depend on how Next merges nested metadata.
 */
export const OG_IMAGE = {
  url: `${SITE_URL}/og`,
  width: 1200,
  height: 630,
  alt: `${BUSINESS.name} — car lift and staff transport to Al Quoz, Dubai`,
};

/** Append the brand to a page title unless it is already there. */
function withBrand(title: string): string {
  return title.endsWith(BRAND_SUFFIX) ? title : `${title}${BRAND_SUFFIX}`;
}

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path: string): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

interface PageMetadataInput {
  /** Without the brand — the root layout's title template appends it. */
  title: string;
  description: string;
  /** Site-relative, leading slash, no trailing slash. e.g. "/routes/deira". */
  path: string;
  /** Overrides OG_IMAGE — e.g. a blog post's cover image. */
  images?: string[];
  type?: "website" | "article";
  publishedTime?: string;
}

/**
 * Builds the canonical + Open Graph + Twitter block for a public page.
 *
 * Always returns a *complete* openGraph object. Next.js shallow-merges
 * metadata, so a page that declares `openGraph` discards every field the parent
 * set rather than merging into it. Before this helper existed, /services,
 * /routes, /portfolio, /contact and /blog all inherited the homepage's og:url
 * and og:title verbatim. Building the whole object in one place removes that
 * trap for good.
 */
export function pageMetadata({
  title,
  description,
  path,
  images,
  type = "website",
  publishedTime,
}: PageMetadataInput): Metadata {
  const ogImages = images?.length ? images : [OG_IMAGE];

  // Shared across both OG variants. Split below because Next types openGraph as
  // a discriminated union on `type` — publishedTime exists only on "article".
  const common = {
    url: absoluteUrl(path),
    siteName: BUSINESS.name,
    locale: "en_AE",
    title: withBrand(title),
    description,
    images: ogImages,
  };

  // Declared with the target type so each branch is contextually checked
  // against the right member of the union.
  const openGraph: Metadata["openGraph"] =
    type === "article"
      ? { ...common, type: "article", ...(publishedTime ? { publishedTime } : {}) }
      : { ...common, type: "website" };

  return {
    title,
    description,
    // Relative — resolved against metadataBase in the root layout.
    alternates: { canonical: path },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: withBrand(title),
      description,
      images: ogImages,
    },
  };
}
