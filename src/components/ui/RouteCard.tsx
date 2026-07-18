import { MapPin, ArrowRight, Clock } from "lucide-react";
import type { Route } from "@/lib/supabase/types";

function bookingUrl(from: string, to: string) {
  const message = `Hi, I want to book a ride from ${from} to ${to}`;
  return `https://wa.me/971566625302?text=${encodeURIComponent(message)}`;
}

export default function RouteCard({
  from_location,
  to_location,
  duration,
  price_one_way,
  price_return,
}: Route) {
  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6 hover:border-emerald-500/20 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <MapPin size={16} className="text-emerald-500" />
        </div>
        <div>
          <div className="flex items-center flex-wrap">
            <span className="text-white font-semibold text-base">
              {from_location}
            </span>
            <ArrowRight size={12} className="text-gray-600 mx-1" />
            <span className="text-gray-400 font-medium text-base">
              {to_location}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Clock size={12} className="text-gray-600" />
            <span className="text-gray-500 text-sm">{duration}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-white/5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">One Way</p>
          <p className="text-white font-bold text-xl mt-1">{price_one_way}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Return</p>
          <p className="text-emerald-400 font-bold text-xl mt-1">{price_return}</p>
        </div>
      </div>

      <a
        href={bookingUrl(from_location, to_location)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 w-full text-center block bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/20 text-white text-sm font-medium py-2.5 rounded-lg transition-all duration-300"
      >
        Book This Route
      </a>
    </div>
  );
}
