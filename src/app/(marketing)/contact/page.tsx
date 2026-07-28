import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import Contact from "@/components/sections/Contact";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Book your car lift to Al Quoz or get in touch with Dammas Express. Call, WhatsApp, or send us your pickup details — available 24/7 across the UAE.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact Us"
        description="Tell us where you need to go and we'll get back to you instantly on WhatsApp. Available 24/7 across all Emirates."
        currentPage="Contact"
      />

      {/* PageHero already renders the h1, so the section's own heading is
          suppressed to avoid a duplicate title stacked directly beneath it. */}
      <Contact hideHeading />
    </>
  );
}
