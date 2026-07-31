import Link from "next/link";
import { MapPin, ArrowRight, Clock, MessageCircle } from "lucide-react";
import type { Route } from "@/lib/supabase/types";

function bookingUrl(from: string) {
  const message = `Hi, I want to book a monthly pass from ${from} to Al Quoz`;
  return `https://wa.me/971566625302?text=${encodeURIComponent(message)}`;
}

export default function RouteCard({
  from_location,
  to_location,
  duration,
  price_one_way,
  slug,
}: Route) {
  const primaryCtaClass =
    "flex-1 text-center py-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors";

  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-xl p-6 hover:border-emerald-500/20 transition-all duration-300 group">
      {/* The route */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <MapPin size={16} className="text-emerald-500" />
        </div>
        <div className="flex items-center flex-wrap">
          <span className="text-white font-semibold text-base">{from_location}</span>
          <ArrowRight size={16} className="text-gray-600 mx-1" />
          <span className="text-gray-400 font-medium text-base">{to_location}</span>
        </div>
      </div>

      {/* Time & price */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-gray-600" />
          <span className="text-gray-500 text-sm">{duration}</span>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Monthly Pass</p>
          <p className="text-white font-bold text-lg">{price_one_way}</p>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex gap-3 mt-5">
        {slug ? (
          <Link href={`/routes/${slug}`} className={primaryCtaClass}>
            View Route Details
          </Link>
        ) : (
          <div className={primaryCtaClass}>View Route Details</div>
        )}

        <a
          href={bookingUrl(from_location)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Book the ${from_location} to ${to_location} route on WhatsApp`}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 text-gray-400 hover:text-emerald-400 hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <MessageCircle size={16} />
        </a>
      </div>
    </div>
  );
}
