// LocalBusiness structured data for Google. Rendered once from the root layout
// so every page carries it, with the homepage as the primary target.
//
// Every value here mirrors what the site actually shows — keep them in sync:
// a NAP mismatch between the visible page and the markup hurts local ranking.
// Sources: name/tagline Footer.tsx, description layout.tsx metadata, address
// Contact.tsx OFFICE_ADDRESS, shift times Hero.tsx TRUST_ITEMS, pickup areas
// RouteMarquee.tsx.

const SITE_URL = "https://dammasexpress.ae";

// Both shifts run every day; trim these once a non-operating day is confirmed.
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
  name: "Dammas Express",
  alternateName: "DAMMAS EXPRESS UAE",
  description:
    "Affordable car lift services to Al Quoz from Deira, Bur Dubai, Karama, Rigga & Abuhail. Monthly passes for AED 250-300. Morning & Evening shifts available.",
  url: SITE_URL,
  telephone: "+971566625302",
  email: "Ehsanch112@gmail.com",
  logo: `${SITE_URL}/images/logo.png`,
  // Only the .jpg/.jpeg banners — Google does not reliably decode the .jfif
  // hero slides.
  image: [
    `${SITE_URL}/images/dammas-express-banner.jpg`,
    `${SITE_URL}/images/dammas-express-fleets-banner.jpeg`,
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Al Falasi Building, 2nd Floor, Office 201",
    addressLocality: "Dubai",
    addressRegion: "Dubai",
    addressCountry: "AE",
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
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ALL_DAYS,
      opens: "07:00",
      closes: "10:00",
      description: "Morning Shift",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ALL_DAYS,
      opens: "17:00",
      closes: "20:00",
      description: "Evening Shift",
    },
  ],
  priceRange: "AED 250 - AED 300 / month",
  currenciesAccepted: "AED",
  // WhatsApp is the only real profile today — the Footer socials are still
  // href="#" placeholders. Add them here once they point somewhere.
  sameAs: ["https://wa.me/971566625302"],
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
