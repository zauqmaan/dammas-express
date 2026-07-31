import { ArrowRight } from "lucide-react";

const routes = [
  "Deira",
  "Al Rigga",
  "Abu Hail",
  "Al Muteena",
  "Al Baraha",
  "Bur Dubai",
  "Al Karama",
  "Sharaf DG",
  "Burjman",
];

export default function RouteMarquee() {
  return (
    <div className="w-full overflow-hidden bg-emerald-500/5 border-y border-emerald-500/10 py-4">
      <div className="flex whitespace-nowrap animate-marquee">
        {/* First set */}
        {routes.map((route, i) => (
          <span key={`a-${i}`} className="flex items-center mx-8">
            <span className="text-gray-400 text-sm">{route}</span>
            <ArrowRight className="mx-2 text-emerald-500/60" size={14} />
            <span className="text-emerald-400 text-sm font-semibold">Al Quoz</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 mx-8 flex-shrink-0"></span>
          </span>
        ))}
        {/* Duplicate set for seamless loop */}
        {routes.map((route, i) => (
          <span key={`b-${i}`} className="flex items-center mx-8">
            <span className="text-gray-400 text-sm">{route}</span>
            <ArrowRight className="mx-2 text-emerald-500/60" size={14} />
            <span className="text-emerald-400 text-sm font-semibold">Al Quoz</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 mx-8 flex-shrink-0"></span>
          </span>
        ))}
      </div>
    </div>
  );
}
