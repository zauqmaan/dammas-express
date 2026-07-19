import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import RouteCard from "@/components/ui/RouteCard";
import { getRoutes } from "@/lib/data";

export const metadata: Metadata = {
  title: "Car Lift Routes to Al Quoz",
  description:
    "Fixed monthly pricing for car lift routes from Deira, Rigga, Bur Dubai, Karama, and Sharaf DG to Al Quoz.",
};

const STEPS = [
  {
    title: "1. Choose Your Route",
    text: "Browse our fixed-price routes below and find the one that matches your journey.",
  },
  {
    title: "2. Book via WhatsApp",
    text: "Tap the book button to send us your route details directly on WhatsApp.",
  },
  {
    title: "3. Enjoy Your Ride",
    text: "We confirm your pickup time and get you to your destination, safe and on time.",
  },
];

const CUSTOM_ROUTE_URL =
  "https://wa.me/971566625302?text=Hi%2C%20I%20need%20a%20quote%20for%20a%20custom%20route";

export default async function RoutesPage() {
  const routes = await getRoutes();

  return (
    <>
      <PageHero
        title="Our Routes"
        description="Transparent, fixed pricing across Dubai. No hidden fees, no surprises — just reliable rides."
        currentPage="Routes"
      />

      <section className="py-16 bg-[#030712]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, index) => (
              <div key={step.title}>
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-sm flex items-center justify-center mb-4">
                  {index + 1}
                </div>
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route) => (
              <RouteCard key={route.id} {...route} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white">Need a Custom Route?</h2>
          <p className="text-gray-400 mt-3">
            We serve all Emirates. If your route isn&apos;t listed, contact us
            directly for a quick quote.
          </p>
          <a
            href={CUSTOM_ROUTE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/25"
          >
            <MessageCircle size={20} />
            Get a Custom Quote
          </a>
        </div>
      </section>
    </>
  );
}
