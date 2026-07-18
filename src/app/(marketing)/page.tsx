import Hero from "@/components/sections/Hero";
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
      <WhyChooseUs />
      <StatsBar />
      <Services data={services} />
      <Routes data={routes} />
      <FleetGallery data={fleet} />
      <BlogPreview data={posts} />
      <CTABanner />
      <Contact />
    </main>
  );
}
