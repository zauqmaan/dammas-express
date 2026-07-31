import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle, MessageCircle, Truck } from "lucide-react";
import { getRouteBySlug, getRoutes, getFleet } from "@/lib/data";

interface RouteDetailPageProps {
  params: { slug: string };
}

function whatsappUrl(from: string) {
  return `https://wa.me/971566625302?text=Hi%2C%20I%20want%20to%20book%20a%20seat%20from%20${encodeURIComponent(
    from
  )}%20to%20Al%20Quoz`;
}

function splitZones(value: string | null) {
  if (!value) return [];
  return value
    .split(",")
    .map((zone) => zone.trim())
    .filter(Boolean);
}

export async function generateStaticParams() {
  const routes = await getRoutes();
  return routes.filter((route) => route.slug).map((route) => ({ slug: route.slug }));
}

export async function generateMetadata({
  params,
}: RouteDetailPageProps): Promise<Metadata> {
  const route = await getRouteBySlug(params.slug);
  if (!route) return { title: "Route Not Found" };
  return {
    title:
      route.meta_title ||
      `Monthly Car Lift from ${route.from_location} to Al Quoz | Dammas Express`,
    description:
      route.meta_description ||
      `Affordable daily and monthly car lift from ${route.from_location} to Al Quoz Industrial Area. Book via WhatsApp!`,
  };
}

export default async function RouteDetailPage({ params }: RouteDetailPageProps) {
  const route = await getRouteBySlug(params.slug);

  if (!route) {
    notFound();
  }

  const fleet = (await getFleet()).slice(0, 3);
  const pickupZones = splitZones(route.pickup_zones);
  const dropoffZones = splitZones(route.dropoff_zones);
  const bookingUrl = whatsappUrl(route.from_location);

  const quickFacts = [
    {
      title: "Fixed Monthly Price",
      value: route.price_one_way,
      note: "No hidden costs, Salik included",
    },
    {
      title: "Morning & Evening Windows",
      value: "Morning: 7:00 AM – 10:00 AM",
      note: "Evening: 5:00 PM – 8:00 PM",
    },
    {
      title: "Operational Days",
      value: "Saturday to Thursday",
      note: "Aligned with industrial shifts",
    },
    {
      title: "Premium Assigned Fleet",
      value: "Toyota HiAce & Coaster",
      note: "Air-conditioned 15-seater and 30-seater",
    },
  ];

  return (
    <div className="bg-[#030712] pb-24 md:pb-0">
      {/* 1. Page hero */}
      <section className="min-h-[50vh] flex items-center relative overflow-hidden bg-gradient-to-b from-[#030712] to-[#0F172A] pt-32 pb-16">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Reliable Daily Car Lift &amp; Transport Service: {route.from_location} to Al
            Quoz
          </h1>
          <p className="text-gray-400 mt-6 text-lg leading-relaxed">
            Tired of expensive taxi fares and long waiting times for public buses? Dammas
            Express offers a structured, premium, yet highly affordable monthly pass for
            professionals commuting daily between {route.from_location} and Al Quoz
            Industrial Area.
          </p>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold mt-10 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25"
          >
            <MessageCircle size={20} />
            Check Seat Availability on WhatsApp
          </a>
        </div>
      </section>

      {/* 2. Quick facts grid */}
      <section className="py-20 bg-[#030712]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickFacts.map((fact) => (
              <div
                key={fact.title}
                className="bg-[#0F172A] border border-white/5 rounded-xl p-6"
              >
                <p className="text-emerald-500 text-xs font-semibold tracking-[0.15em] uppercase">
                  {fact.title}
                </p>
                <p className="text-2xl font-bold text-white mt-3 leading-snug">
                  {fact.value}
                </p>
                <p className="text-gray-500 text-sm mt-2">{fact.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Localized zones */}
      {(pickupZones.length > 0 || dropoffZones.length > 0) && (
        <section className="py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Pickup Zones in {route.from_location}
                </h2>
                <ul className="space-y-3">
                  {pickupZones.map((zone) => (
                    <li key={zone} className="flex items-start gap-3">
                      <CheckCircle
                        size={18}
                        className="text-emerald-500 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-gray-300">{zone}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Drop-off Zones in Al Quoz
                </h2>
                <ul className="space-y-3">
                  {dropoffZones.map((zone) => (
                    <li key={zone} className="flex items-start gap-3">
                      <CheckCircle
                        size={18}
                        className="text-emerald-500 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-gray-300">{zone}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Route details / SEO content from the dashboard editor */}
      {route.content && (
        <section className="py-20 border-t border-white/5">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="prose prose-invert prose-sm md:prose-base max-w-none
              prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
              prose-p:text-gray-400 prose-p:leading-relaxed
              prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
              prose-li:text-gray-400
              prose-strong:text-white"
              dangerouslySetInnerHTML={{ __html: route.content }}
            />
          </div>
        </section>
      )}

      {/* 4. Fleet gallery */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight text-center">
            Our Fleet for this Route
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {fleet.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-[#0F172A] border border-white/5 rounded-xl overflow-hidden hover:border-emerald-500/20 transition-all duration-300"
              >
                <div className="relative h-56 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
                  {vehicle.image_url ? (
                    <img
                      src={vehicle.image_url}
                      alt={`${vehicle.name} used for the ${route.from_location} to Al Quoz car lift route`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Truck size={56} className="text-gray-700" />
                  )}
                  <span className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-xs font-medium px-3 py-1 rounded-full text-gray-300">
                    {vehicle.type}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-white font-bold text-lg">{vehicle.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{vehicle.type}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-gray-500 text-sm mt-8 max-w-3xl mx-auto text-center">
            Our fully licensed RTA passenger transport fleet is equipped with
            high-performance commercial air-conditioning, regularly serviced engines, and
            professionally trained drivers who know every shortcut between{" "}
            {route.from_location} and Al Quoz Industrial Area.
          </p>
        </div>
      </section>

      {/* 5. Micro-FAQ */}
      {route.faq && route.faq.length > 0 && (
        <section className="py-20 border-t border-white/5">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4 mt-12">
              {route.faq.map((item) => (
                <div
                  key={item.question}
                  className="bg-[#0F172A] border border-white/5 rounded-xl overflow-hidden p-5"
                >
                  <p className="font-semibold text-white">{item.question}</p>
                  <p className="text-gray-400 mt-2 leading-relaxed pl-4 border-l-2 border-emerald-500/30">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0F172A]/95 backdrop-blur-lg border-t border-white/5 p-4 z-50 md:hidden">
        <div className="flex justify-between items-center">
          <span className="text-white font-semibold text-sm">Commute Stress-Free</span>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium"
          >
            Book Pass
          </a>
        </div>
      </div>
    </div>
  );
}
