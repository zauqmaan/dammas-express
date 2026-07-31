import { Truck, MapPin, ShieldCheck, Clock, type LucideIcon } from "lucide-react";

const FEATURES: {
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}[] = [
  {
    Icon: Truck,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    title: "Premium Fleet",
    description:
      "Modern, well-maintained vehicles including Toyota HiAce and Coaster models, serviced regularly for your safety.",
  },
  {
    Icon: MapPin,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    title: "Dedicated Al Quoz Commute Hubs",
    description:
      "While we cover multiple routes, our fleet specializes in seamless, direct daily worker transport and car lift lines straight into Al Quoz Industrial Area 1, 2, 3, and 4.",
  },
  {
    Icon: ShieldCheck,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    title: "Licensed & Insured",
    description:
      "Fully licensed by RTA Dubai. Every vehicle is insured and every driver is professionally trained and verified.",
  },
  {
    Icon: Clock,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    title: "Aligned Corporate Shift Timings",
    description:
      "Perfect for commercial environments. Fixed morning shifts (7:00 AM to 10:00 AM) and evening returns (5:00 PM to 8:00 PM) guarantee you or your staff never clock in late.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 md:py-28 bg-[#030712]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-emerald-500 text-xs font-semibold tracking-[0.2em] uppercase">
            Why Dammas Express
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white tracking-tight">
            Trusted Transportation Across the UAE
          </h2>
          <p className="text-gray-400 text-base mt-4 max-w-2xl mx-auto">
            Professional fleet, transparent pricing, and reliable service — every
            single time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {FEATURES.map(({ Icon, iconBg, iconColor, title, description }) => (
            <div
              key={title}
              className="bg-[#0F172A] border border-white/5 rounded-xl p-6 md:p-8 hover:border-emerald-500/20 hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center mb-5`}
              >
                <Icon size={20} className={iconColor} />
              </div>
              <h3 className="text-white font-semibold text-lg">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mt-2">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
