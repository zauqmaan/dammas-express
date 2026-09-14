import PageHero from "@/components/sections/PageHero";
import Contact from "@/components/sections/Contact";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact — Car Lift to Al Quoz, Dubai",
  description:
    "Get in touch with Dammas Express any time — we answer calls and WhatsApp 24/7. Car lift routes to Al Quoz run Monday to Friday, morning and evening shifts.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact Dammas Express — Car Lift in Al Quoz, Dubai"
        description="Tell us where you need to go and we'll get back to you instantly on WhatsApp — we're reachable 24/7, any day. Rides run Monday to Friday, morning and evening shifts."
        currentPage="Contact"
      />

      {/* PageHero already renders the h1, so the section's own heading is
          suppressed to avoid a duplicate title stacked directly beneath it. */}
      <Contact hideHeading />
    </>
  );
}
