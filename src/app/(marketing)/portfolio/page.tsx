import type { Metadata } from "next";
import { Truck, CheckCircle2 } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import { getFleet } from "@/lib/data";

export const metadata: Metadata = {
  title: "Our Fleet & Portfolio",
  description:
    "View our modern fleet including Toyota HiAce and Coaster vehicles available for daily and monthly rental.",
};

const TRUST_BAR = [
  { value: "50+ Vehicles", label: "Growing fleet across the UAE" },
  { value: "24/7 Ready", label: "Dispatch never sleeps" },
  { value: "100% Insured", label: "Every vehicle, every trip" },
  { value: "RTA Licensed", label: "Fully compliant in Dubai" },
];

function bookingUrl(vehicle: string) {
  const message = `Hi, I want to get a quote for a ${vehicle}`;
  return `https://wa.me/971566625302?text=${encodeURIComponent(message)}`;
}

export default async function PortfolioPage() {
  const fleet = await getFleet();

  return (
    <>
      <PageHero
        title="Our Fleet & Portfolio"
        description="A look at our modern, well-maintained vehicles ready to serve you across the UAE."
        currentPage="Portfolio"
      />

      <section className="py-20 md:py-28 bg-[#030712]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          {fleet.map((vehicle, index) => {
            const isEven = index % 2 === 1;
            return (
              <div
                key={vehicle.id}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
              >
                <div className={isEven ? "lg:order-last" : ""}>
                  <span className="inline-block bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    {vehicle.type}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    {vehicle.name}
                  </h2>
                  <p className="text-gray-400 leading-relaxed mt-4">
                    {vehicle.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    <div className="bg-[#0F172A] border border-white/5 rounded-lg p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Passengers
                      </p>
                      <p className="text-white font-semibold mt-1">
                        {vehicle.passengers}
                      </p>
                    </div>
                    <div className="bg-[#0F172A] border border-white/5 rounded-lg p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Luggage
                      </p>
                      <p className="text-white font-semibold mt-1">
                        {vehicle.luggage}
                      </p>
                    </div>
                  </div>

                  {vehicle.features?.length > 0 && (
                    <ul className="mt-6 space-y-2.5">
                      {vehicle.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5">
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <a
                    href={bookingUrl(vehicle.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium text-sm transition-all"
                  >
                    Contact for Pricing
                  </a>
                </div>

                <div className={isEven ? "lg:order-first" : ""}>
                  <div className="bg-[#0F172A] border border-white/5 rounded-2xl h-80 lg:h-[600px] flex items-center justify-center overflow-hidden">
                    {vehicle.image_url ? (
                      <img
                        src={vehicle.image_url}
                        alt={vehicle.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Truck size={96} className="text-gray-800/50" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-12 border-t border-b border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {TRUST_BAR.map(({ value, label }) => (
              <div key={value}>
                <p className="text-white font-bold text-xl">{value}</p>
                <p className="text-gray-500 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
