import { Truck, Check } from "lucide-react";
import type { FleetVehicle } from "@/lib/supabase/types";

interface FleetGalleryProps {
  data: FleetVehicle[];
}

function bookingUrl(vehicle: string) {
  const message = `Hi, I want to get a quote for a ${vehicle}`;
  return `https://wa.me/971566625302?text=${encodeURIComponent(message)}`;
}

export default function FleetGallery({ data }: FleetGalleryProps) {
  return (
    <section className="py-20 md:py-28 bg-[#030712]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-emerald-500 text-xs font-semibold tracking-[0.2em] uppercase">
            Our Fleet
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white tracking-tight">
            Modern Vehicles for Every Journey
          </h2>
          <p className="text-gray-400 text-base mt-4 max-w-2xl mx-auto">
            Choose from our well-maintained fleet — from daily shuttles to
            premium coasters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {data.map((vehicle) => (
            <div
              key={vehicle.id}
              className="group bg-[#0F172A] border border-white/5 rounded-xl overflow-hidden hover:border-emerald-500/20 transition-all duration-300"
            >
              <div className="relative h-96 object-cover bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
                {vehicle.image_url ? (
                  <img src={vehicle.image_url} alt={vehicle.name} className="w-full h-full object-cover" />
                ) : (
                  <Truck size={64} className="text-gray-700" />
                )}
                <span className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-xs font-medium px-3 py-1 rounded-full text-gray-300">
                  {vehicle.type}
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-white font-bold text-xl">{vehicle.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mt-3">
                  {vehicle.description}
                </p>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div className="bg-white/5 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Passengers
                    </p>
                    <p className="text-white text-sm font-semibold mt-0.5">
                      {vehicle.passengers}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Luggage
                    </p>
                    <p className="text-white text-sm font-semibold mt-0.5">
                      {vehicle.luggage}
                    </p>
                  </div>
                </div>

                <ul className="mt-5 space-y-2.5">
                  {vehicle.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5">
                      <Check size={16} className="text-emerald-500/70" />
                      <span className="text-gray-400 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-5 border-t border-white/5">
                  <a
                    href={bookingUrl(vehicle.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white font-medium text-sm transition-all duration-300"
                  >
                    Contact for Pricing
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
