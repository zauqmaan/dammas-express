import type { Metadata } from "next";
import { Car, CalendarRange, Plane, Building2, Truck, CheckCircle2, type LucideIcon } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import { getServices } from "@/lib/data";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Daily car lift, monthly subscriptions, airport transfers, and corporate pick & drop services across Dubai and UAE.",
};

const iconMap: Record<string, LucideIcon> = {
  Car,
  CalendarRange,
  Plane,
  Building2,
  Truck,
};

function bookingUrl(serviceName: string) {
  const message = `Hi, I am interested in your ${serviceName} service`;
  return `https://wa.me/971566625302?text=${encodeURIComponent(message)}`;
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHero
        title="Our Services"
        description="Reliable, safe, and affordable transportation solutions tailored for your needs across the UAE."
        currentPage="Services"
      />

      <section className="py-20 md:py-28 bg-[#030712]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon_name] || Truck;
            const isEven = index % 2 === 1;
            return (
              <div
                key={service.slug}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
              >
                <div className={isEven ? "lg:order-last" : ""}>
                  <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6">
                    <IconComponent size={24} className="text-emerald-500" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    {service.title}
                  </h2>
                  <p className="text-gray-400 leading-relaxed mt-4">
                    {service.description}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle2
                          size={20}
                          className="text-emerald-500 mt-0.5 shrink-0"
                        />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={bookingUrl(service.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white px-6 py-3 rounded-lg font-medium text-sm transition-all"
                  >
                    Book This Service
                  </a>
                </div>

                <div className={isEven ? "lg:order-first" : ""}>
                  <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-8 md:p-12 flex items-center justify-center">
                    <IconComponent size={96} className="text-gray-800/50" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
