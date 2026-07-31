"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Car,
  CalendarRange,
  Plane,
  Building2,
  Truck,
  ArrowRight,
  CheckCircle,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import type { Service } from "@/lib/supabase/types";

interface ServicesProps {
  data: Service[];
}

const iconMap: Record<string, LucideIcon> = {
  Car,
  CalendarRange,
  Plane,
  Building2,
  Truck,
};

const TRUST_PILLS = [
  "Professional RTA-Licensed Drivers",
  "Flexible Scheduling",
  "Corporate Solutions Available",
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function bookingUrl(serviceName: string) {
  const message = `Hi, I am interested in your ${serviceName} service`;
  return `https://wa.me/971566625302?text=${encodeURIComponent(message)}`;
}

export default function Services({ data }: ServicesProps) {
  return (
    <section id="services" className="py-20 md:py-28 bg-[#030712]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-emerald-500 text-xs font-semibold tracking-[0.2em] uppercase">
            Our Services
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white tracking-tight">
            Transportation Solutions for Every Need
          </h2>
          <p className="text-gray-400 text-base mt-4 max-w-2xl mx-auto">
            From daily commutes to corporate contracts — we&apos;ve got your route
            covered.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16"
        >
          {data.map((service, index) => {
            const IconComponent = iconMap[service.icon_name] || Truck;
            const isAmber = index % 2 === 1;

            return (
              <motion.div
                key={service.slug}
                variants={cardVariants}
                className="group relative overflow-hidden bg-[#0F172A] border border-white/5 rounded-xl p-8 hover:border-emerald-500/20 transition-all duration-300"
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
                  aria-hidden="true"
                />

                <div
                  className={`relative w-14 h-14 rounded-xl ${
                    isAmber ? "bg-amber-500/10" : "bg-emerald-500/10"
                  } flex items-center justify-center mb-6`}
                >
                  <IconComponent
                    size={24}
                    className={isAmber ? "text-amber-500" : "text-emerald-500"}
                  />
                </div>

                <h3 className="relative text-white font-bold text-xl">
                  {service.title}
                </h3>
                <p className="relative text-gray-400 text-sm leading-relaxed mt-3 pr-8">
                  {service.description}
                </p>

                {service.features?.length > 0 && (
                  <ul className="relative mt-4 space-y-2">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-gray-400 text-sm"
                      >
                        <CheckCircle size={14} className="text-emerald-500/70 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="relative flex items-center justify-between gap-3">
                  <Link
                    href="/services"
                    className="mt-4 flex items-center gap-1 text-emerald-500 text-sm font-medium group-hover:text-emerald-400 transition-colors"
                  >
                    Learn More{" "}
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Link>

                  <a
                    href={bookingUrl(service.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Enquire about ${service.title} on WhatsApp`}
                    className="mt-4 flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 text-gray-400 hover:text-emerald-400 hover:bg-white/10 transition-colors"
                  >
                    <MessageCircle size={16} />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
          {TRUST_PILLS.map((label) => (
            <div key={label} className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle size={16} className="text-emerald-500/60" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
