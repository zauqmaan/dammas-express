"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Shield, Clock, MapPin, ChevronDown } from "lucide-react";

const TRUST_ITEMS = [
  { Icon: Shield, label: "Fully Licensed & Insured" },
  { Icon: Clock, label: "Shifts: 7-10 AM & 5-8 PM" },
  { Icon: MapPin, label: "All Emirates Covered" },
];

const SLIDES = [
  '/images/dammas-express-fleets-banner.jpeg',
  '/images/bruj-khalifa-landscape.jfif',
  '/images/home-banner-uae-landscape.jfif',
  '/images/dammas-express-banner.jpg'
]

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-4 pt-24 pb-16">
      {/* Slideshow background */}
      {SLIDES.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        />
      ))}

      {/* Dark gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#030712] z-10" />

      {/* Badge */}
      <motion.div {...fadeUp(0.1)} className="relative z-20 flex justify-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium tracking-wide uppercase">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
          🇦🇪 Morning & Evening Shifts
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        {...fadeUp(0.2)}
        className="relative z-20 mt-8 max-w-4xl mx-auto text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white text-center leading-[1.1]"
      >
        <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
          Reliable
        </span>{" "}
        Car Lift
        <br />
        Services to Al Quoz
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        {...fadeUp(0.3)}
        className="relative z-20 mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-400 text-center leading-relaxed"
      >
        Affordable daily and monthly rides from Deira, Bur Dubai, and Karama to Al Quoz.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div {...fadeUp(0.4)} className="relative z-20 mt-10 flex items-center justify-center gap-4 flex-wrap">
        <a
          href="#contact"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-lg font-semibold text-base transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5"
        >
          <Calendar size={18} />
          Book Your Ride
        </a>
        <a
          href="#services"
          className="flex items-center gap-2 bg-transparent border border-white/10 hover:border-white/20 text-white px-8 py-3.5 rounded-lg font-medium text-base transition-all duration-300 hover:bg-white/5"
        >
          View Services
          <ArrowRight size={18} />
        </a>
      </motion.div>

      {/* Trust indicators */}
      <motion.div
        {...fadeUp(0.5)}
        className="relative z-20 mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-6 md:gap-x-12"
      >
        {TRUST_ITEMS.map(({ Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <Icon size={20} className="text-emerald-500/60" />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </motion.div>

      {/* Slide indicator dots */}
      <div className="relative z-20 mt-10 flex items-center justify-center gap-2">
        {SLIDES.map((src, index) => (
          <button
            key={src}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? "w-6 bg-emerald-500" : "w-2 bg-white/20"
            }`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <ChevronDown size={20} className="text-gray-600 animate-bounce-subtle" />
      </div>
    </section>
  );
}
