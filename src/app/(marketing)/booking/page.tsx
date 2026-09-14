import PageHero from "@/components/sections/PageHero";
import Contact from "@/components/sections/Contact";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Book a Car Lift to Al Quoz, Dubai",
  description:
    "Reserve your seat on a monthly car lift to Al Quoz from Deira, Bur Dubai, Karama, Rigga or Abu Hail. Book any time; rides run Monday to Friday, morning and evening.",
  path: "/booking",
});

export default function BookingPage() {
  return (
    <>
      <PageHero
        title="Book Your Car Lift to Al Quoz"
        description="Tell us your pickup area and preferred shift. Book any time — we reply 24/7 — and your seat runs Monday to Friday, morning 7–10 AM or evening 5–8 PM."
        currentPage="Booking"
      />

      {/* Same form as /contact — PageHero already renders the h1, so the
          section's own heading is suppressed to avoid a duplicate title. */}
      <Contact hideHeading />
    </>
  );
}
