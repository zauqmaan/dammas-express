import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle, ChevronRight, MessageCircle, Truck } from "lucide-react";
import { getRouteBySlug, getRoutes, getFleet, getPublishedPosts } from "@/lib/data";
import { prepareContentHtml } from "@/lib/content";
import { ROUTE_LINKS } from "@/lib/route-links";
import type { Route } from "@/lib/supabase/types";
import { absoluteUrl, BRAND_SUFFIX, BUSINESS_ID, HOURS, pageMetadata } from "@/lib/seo";

interface RouteDetailPageProps {
  params: { slug: string };
}

function whatsappUrl(from: string) {
  return `https://wa.me/971566625302?text=Hi%2C%20I%20want%20to%20book%20a%20seat%20from%20${encodeURIComponent(
    from
  )}%20to%20Al%20Quoz`;
}

/** "AED 300/ month" → "300". Null when the stored price has no number in it. */
function monthlyPriceValue(price: string | null) {
  const match = price?.match(/\d[\d,]*(?:\.\d+)?/);
  return match ? match[0].replace(/,/g, "") : null;
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
  if (!route) return { title: "Route Not Found", robots: { index: false } };

  // The root layout's title template appends the brand, but the dashboard's
  // meta_title placeholder ends with it too — strip it so editors who follow
  // the placeholder don't end up with "… | Dammas Express | Dammas Express".
  // A plain suffix check rather than a regex: BRAND_SUFFIX contains a "|",
  // which would be read as alternation and match nearly anything.
  const rawTitle = route.meta_title?.trim();
  const metaTitle =
    rawTitle && rawTitle.toLowerCase().endsWith(BRAND_SUFFIX.toLowerCase())
      ? rawTitle.slice(0, -BRAND_SUFFIX.length).trim()
      : rawTitle;

  return pageMetadata({
    // The fallback used to hardcode "Deira" for every route, so a Bur Dubai
    // route rendered "Deira Car Lift & Transport from Bur Dubai to Al Quoz".
    title: metaTitle || `Car Lift from ${route.from_location} to Al Quoz, Dubai`,
    description:
      route.meta_description ||
      `Affordable daily and monthly car lift from ${route.from_location} to Al Quoz Industrial Area. Book via WhatsApp!`,
    path: `/routes/${params.slug}`,
  });
}

export default async function RouteDetailPage({ params }: RouteDetailPageProps) {
  const route = await getRouteBySlug(params.slug);

  if (!route) {
    notFound();
  }

  const links = ROUTE_LINKS[route.slug];
  const [allFleet, allRoutes, posts] = await Promise.all([
    getFleet(),
    getRoutes(),
    getPublishedPosts(),
  ]);
  const fleet = allFleet.slice(0, 3);
  const pickupZones = splitZones(route.pickup_zones);
  const dropoffZones = splitZones(route.dropoff_zones);
  const bookingUrl = whatsappUrl(route.from_location);
  const routeName = `${route.from_location} to Al Quoz`;

  // Only active routes and published posts are linked, so switching one off in
  // the dashboard can never leave a broken link on another page.
  const nearbyRoutes = (links?.nearby ?? [])
    .map((nearbySlug) => allRoutes.find((r) => r.slug === nearbySlug))
    .filter((r): r is Route => Boolean(r));
  const guide = links?.guide ? posts.find((post) => post.slug === links.guide) : undefined;

  const quickFacts = [
    {
      title: "Fixed Monthly Price",
      value: route.price_one_way,
      note: "No hidden costs, Salik included",
    },
    {
      title: "Morning & Evening Windows",
      value: `Morning: ${HOURS.morning}`,
      note: `Evening: ${HOURS.evening}`,
    },
    {
      title: "Operational Days",
      value: HOURS.serviceDays,
      note: `Book any time — enquiries answered ${HOURS.contact}`,
    },
    {
      // Was "Premium Assigned Fleet", which implied specific vehicles are
      // assigned to each route — the fleet is shared across routes.
      title: "Vehicles",
      value: "Toyota HiAce & Coaster",
      note: "Air-conditioned 15-seater and 30-seater",
    },
    {
      // Was "Distance & Time … via E11 / E44" on every route, which was not
      // accurate for all of them. The stored duration is a typical estimate.
      title: "Typical Travel Time",
      value: route.duration,
      note: "Approximate — varies with traffic",
    },
  ];

  const priceValue = monthlyPriceValue(route.price_one_way);
  const pageUrl = absoluteUrl(`/routes/${route.slug}`);

  // Describes only what the page visibly states: the trip, the provider, and
  // the monthly price shown in the quick facts.
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Routes", item: absoluteUrl("/routes") },
        { "@type": "ListItem", position: 3, name: routeName, item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `${routeName} car lift`,
      serviceType: "Shared monthly passenger transport (car lift)",
      url: pageUrl,
      provider: { "@id": BUSINESS_ID },
      areaServed: [
        { "@type": "Place", name: route.from_location },
        { "@type": "Place", name: "Al Quoz" },
      ],
      ...(priceValue
        ? {
            offers: {
              "@type": "Offer",
              price: priceValue,
              priceCurrency: "AED",
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: priceValue,
                priceCurrency: "AED",
                unitText: "MONTH",
              },
            },
          }
        : {}),
    },
  ];

  return (
    <div className="bg-[#030712] pb-24 md:pb-0">
      <script
        type="application/ld+json"
        // Escape `<` so no stored string can ever close the script tag early
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      {/* 1. Page hero */}
      <section className="min-h-[50vh] flex items-center relative overflow-hidden bg-gradient-to-b from-[#030712] to-[#0F172A] pt-32 pb-16">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center justify-center flex-wrap gap-2 text-sm">
              <li>
                <Link href="/" className="text-gray-500 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight size={12} className="text-gray-700" aria-hidden="true" />
                <Link href="/routes" className="text-gray-500 hover:text-white transition-colors">
                  Routes
                </Link>
              </li>
              <li aria-current="page" className="flex items-center gap-2 text-emerald-400 font-medium">
                <ChevronRight size={12} className="text-gray-700" aria-hidden="true" />
                {routeName}
              </li>
            </ol>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            {route.from_location} to Al Quoz Car Lift &amp; Monthly Transport
          </h1>
          {/* Deliberately short and neutral: the route-specific introduction
              lives in the editorial content below. This paragraph used to be a
              long identical sales pitch repeated on every route page. */}
          <p className="text-gray-400 mt-6 text-lg leading-relaxed">
            Shared monthly transport from {route.from_location} to Al Quoz Industrial
            Areas 1–4, with fixed morning and evening trips, {HOURS.serviceDays}.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
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
            {/* Each column renders only when it has zones — a route with only
                drop-offs filled in must not show an empty "Pickup Zones" heading. */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {pickupZones.length > 0 && (
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
              )}

              {dropoffZones.length > 0 && (
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
              )}
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
              dangerouslySetInnerHTML={{ __html: prepareContentHtml(route.content) }}
            />
          </div>
        </section>
      )}

      {/* 4. Fleet gallery */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Not "for this Route": vehicles are shared across routes, and the
              page should not imply a specific vehicle runs this trip. */}
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight text-center">
            Our Fleet
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
                      alt={`${vehicle.name} ${vehicle.type.toLowerCase()} from the Dammas Express fleet`}
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
            Trips run in air-conditioned commercial passenger vehicles from our RTA-licensed
            fleet.
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

      {/* 6. Related routes and guides — the route page owns booking intent;
          the guide covers distance and transport options for the same trip. */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight text-center">
            Plan Your Commute
          </h2>

          <ul className="mt-10 space-y-3">
            {guide && (
              <li>
                <Link
                  href={`/blog/${guide.slug}`}
                  className="flex items-center justify-between gap-4 bg-[#0F172A] border border-white/5 rounded-xl p-5 hover:border-emerald-500/20 transition-colors"
                >
                  <span>
                    <span className="block text-xs text-emerald-500 font-semibold uppercase tracking-wide">
                      Travel guide
                    </span>
                    <span className="block text-white font-medium mt-1">{guide.title}</span>
                  </span>
                  <ArrowRight size={18} className="text-gray-500 shrink-0" />
                </Link>
              </li>
            )}
            <li>
              <Link
                href="/services"
                className="flex items-center justify-between gap-4 bg-[#0F172A] border border-white/5 rounded-xl p-5 hover:border-emerald-500/20 transition-colors"
              >
                <span className="text-white font-medium">
                  Monthly car lift and staff transport services
                </span>
                <ArrowRight size={18} className="text-gray-500 shrink-0" />
              </Link>
            </li>
            <li>
              <Link
                href="/booking"
                className="flex items-center justify-between gap-4 bg-[#0F172A] border border-white/5 rounded-xl p-5 hover:border-emerald-500/20 transition-colors"
              >
                <span className="text-white font-medium">
                  Request a seat or a company transport quote
                </span>
                <ArrowRight size={18} className="text-gray-500 shrink-0" />
              </Link>
            </li>
          </ul>

          {nearbyRoutes.length > 0 && (
            <>
              <h3 className="text-white font-semibold mt-12">Nearby pickup areas</h3>
              <ul className="mt-4 flex flex-wrap gap-3">
                {nearbyRoutes.map((nearby) => (
                  <li key={nearby.slug}>
                    <Link
                      href={`/routes/${nearby.slug}`}
                      className="inline-flex items-center gap-2 bg-[#0F172A] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:border-emerald-500/20 transition-colors"
                    >
                      {nearby.from_location} to Al Quoz
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/routes"
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    All routes and prices
                    <ArrowRight size={14} />
                  </Link>
                </li>
              </ul>
            </>
          )}
        </div>
      </section>

      {/* 7. Sticky mobile CTA */}
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
