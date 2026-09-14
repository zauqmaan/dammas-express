// LocalBusiness structured data for Google. Rendered once from the root layout
// so every page carries it, with the homepage as the primary target.
//
// Every value here mirrors what the site actually shows — keep them in sync:
// a NAP mismatch between the visible page and the markup hurts local ranking.
// The name, address, phone and email now come from BUSINESS in src/lib/seo.ts,
// which is the same object the Footer and Contact section render, so the three
// can no longer drift apart. Shift times come from Hero.tsx TRUST_ITEMS and
// pickup areas from RouteMarquee.tsx.

import {
  BUSINESS,
  HOME_DESCRIPTION,
  SERVICE_DAYS,
  SERVICE_WINDOWS,
  SITE_URL,
} from "@/lib/seo";

const ALL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const schema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: BUSINESS.name,
  alternateName: BUSINESS.legalName,
  description: HOME_DESCRIPTION,
  url: SITE_URL,
  telephone: BUSINESS.phone,
  email: BUSINESS.email,
  logo: `${SITE_URL}/images/logo.png`,
  // Only the .jpg/.jpeg banners — Google does not reliably decode the .jfif
  // hero slides.
  image: [
    `${SITE_URL}/images/dammas-express-banner.jpg`,
    `${SITE_URL}/images/dammas-express-fleets-banner.jpeg`,
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: BUSINESS.streetAddress,
    addressLocality: BUSINESS.locality,
    addressRegion: BUSINESS.region,
    addressCountry: BUSINESS.countryCode,
  },
  areaServed: [
    { "@type": "City", name: "Dubai" },
    { "@type": "Place", name: "Al Quoz" },
    { "@type": "Place", name: "Deira" },
    { "@type": "Place", name: "Al Rigga" },
    { "@type": "Place", name: "Abu Hail" },
    { "@type": "Place", name: "Al Muteena" },
    { "@type": "Place", name: "Al Baraha" },
    { "@type": "Place", name: "Bur Dubai" },
    { "@type": "Place", name: "Al Karama" },
    { "@type": "Place", name: "Burjuman" },
  ],
  // When the vehicles actually run: two fixed windows, weekdays only. This is
  // deliberately narrower than the contact point below — enquiries are answered
  // any time, but no route operates at the weekend.
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [...SERVICE_DAYS],
      opens: SERVICE_WINDOWS.morning.opens,
      closes: SERVICE_WINDOWS.morning.closes,
      description: "Morning Shift",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [...SERVICE_DAYS],
      opens: SERVICE_WINDOWS.evening.opens,
      closes: SERVICE_WINDOWS.evening.closes,
      description: "Evening Shift",
    },
  ],
  // Bookings and enquiries are answered around the clock, every day, which is a
  // different thing from when the vehicles run.
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    areaServed: "AE",
    availableLanguage: ["en", "ar", "ur", "hi"],
    hoursAvailable: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ALL_DAYS,
      opens: "00:00",
      closes: "23:59",
    },
  },
  priceRange: "AED 250 - AED 300 / month",
  currenciesAccepted: "AED",
  // WhatsApp is the only profile the business actually maintains. The Footer
  // used to render four href="#" placeholder icons; those have been removed
  // rather than left pointing nowhere. Add real Facebook/Instagram URLs to both
  // this array and SOCIALS in Footer.tsx when the accounts exist.
  sameAs: [BUSINESS.whatsapp],
};

export default function DamasExpressJsonLd() {
  return (
    <script
      type="application/ld+json"
      // Escape `<` so no string value can ever close the script tag early
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
