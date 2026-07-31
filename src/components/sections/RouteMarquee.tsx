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
      {/* w-max sizes the track to its content so the -50% keyframe lands exactly
          one copy along — without it the track is only as wide as the viewport
          and the loop snaps mid-list. */}
      <div className="flex w-max whitespace-nowrap animate-marquee">
        {/* First set */}
        {routes.map((route, i) => (
          <span key={`a-${i}`} className="flex items-center mx-3 flex-shrink-0">
            <span className="text-gray-400 text-sm">{route}</span>
            <ArrowRight className="mx-2 text-emerald-500/60" size={14} />
            <span className="text-emerald-400 text-sm font-semibold">Al Quoz</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 mx-8 flex-shrink-0"></span>
          </span>
        ))}
        {/* Duplicate set for seamless loop — hidden from screen readers so the
            routes aren't announced twice. */}
        {routes.map((route, i) => (
          <span key={`b-${i}`} aria-hidden="true" className="flex items-center mx-3 flex-shrink-0">
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
