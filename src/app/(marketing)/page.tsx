import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/sections/Hero";
import RouteMarquee from "@/components/sections/RouteMarquee";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import StatsBar from "@/components/sections/StatsBar";
import Services from "@/components/sections/Services";
import Routes from "@/components/sections/Routes";
import FleetGallery from "@/components/sections/FleetGallery";
import BlogPreview from "@/components/sections/BlogPreview";
import CTABanner from "@/components/sections/CTABanner";
import Contact from "@/components/sections/Contact";
import { getServices, getRoutes, getFleet, getPublishedPosts } from "@/lib/data";
import { HOME_DESCRIPTION, HOME_TITLE, pageMetadata } from "@/lib/seo";

// The homepage's canonical, og:url and OG/Twitter text live here rather than in
// the root layout, so no other page can inherit them by accident.
export const metadata: Metadata = {
  ...pageMetadata({ title: HOME_TITLE, description: HOME_DESCRIPTION, path: "/" }),
  // HOME_TITLE already ends with the brand — `absolute` skips the root layout's
  // "%s | Dammas Express" template so it is not appended a second time.
  title: { absolute: HOME_TITLE },
};

export default async function Home() {
  // Independent queries — run them together rather than in series, which cost
  // four sequential Supabase round trips before the page could start rendering.
  const [services, routes, fleet, posts] = await Promise.all([
    getServices(),
    getRoutes(),
    getFleet(),
    getPublishedPosts(),
  ]);

  return (
    <main id="home">
      <Hero />
      <RouteMarquee />
      <WhyChooseUs />
      <StatsBar />
      <div className="text-center max-w-2xl mx-auto my-12">
        <p className="text-gray-400 text-base">
          Looking for a structured corporate fleet arrangement? Learn more about our specialized{' '}
          <Link href="/services" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors">
            Al Quoz transport service
          </Link>{' '}
          tailored for businesses, or explore individual{' '}
          <Link href="/services" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors">
            monthly car lift passes
          </Link>.
        </p>
      </div>
      <Services data={services} />
      <Routes data={routes} />
      <FleetGallery data={fleet} />
      <BlogPreview data={posts} />
      <CTABanner />
      <Contact />
    </main>
  );
}
