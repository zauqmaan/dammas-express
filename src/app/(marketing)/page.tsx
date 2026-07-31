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

export default async function Home() {
  const services = await getServices();
  const routes = await getRoutes();
  const fleet = await getFleet();
  const posts = await getPublishedPosts();

  return (
    <main id="home">
      <Hero />
      <RouteMarquee />
      <WhyChooseUs />
      <StatsBar />
      <div className="text-center max-w-2xl mx-auto mb-12">
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
