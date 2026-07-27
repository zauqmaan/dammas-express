"use client";

import { useState, type FormEvent, type ChangeEvent, type MouseEvent } from "react";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { submitInquiry } from "@/lib/data";

const CONTACT_ITEMS = [
  {
    Icon: MapPin,
    title: "Our Office",
    content: (
      <>
        <p className="text-gray-400 text-sm mt-1">
          Burj Nahar Building 303 office, Dubai, UAE
        </p>
        <p className="text-gray-500 text-xs mt-1">📍 We serve all Emirates</p>
      </>
    ),
  },
  {
    Icon: Phone,
    title: "Phone / WhatsApp",
    content: (
      <a
        href="tel:+971566625302"
        className="text-white font-medium text-sm mt-1 inline-block hover:text-emerald-400 transition-colors"
      >
        +971 56 662 5302
      </a>
    ),
  },
  {
    Icon: Mail,
    title: "Email",
    content: (
      <a
        href="mailto:Ehsanch112@gmail.com"
        className="text-white font-medium text-sm mt-1 inline-block hover:text-emerald-400 transition-colors"
      >
        Ehsanch112@gmail.com
      </a>
    ),
  },
  {
    Icon: Clock,
    title: "Working Hours",
    content: <p className="text-gray-400 text-sm mt-1">24/7 Available</p>,
  },
];

const OFFICE_ADDRESS = "Burj Nahar Building 303 office, Dubai, UAE";
const MAP_EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(
  OFFICE_ADDRESS
)}&output=embed`;

const INITIAL_FORM = {
  name: "",
  phone: "",
  pickup: "",
  dropoff: "",
  date: "",
  time: "",
};

const inputClasses =
  "w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors";

interface ContactProps {
  /** Skip the section heading when the page already has one (e.g. the /contact page hero). */
  hideHeading?: boolean;
}

export default function Contact({ hideHeading = false }: ContactProps) {
  const [form, setForm] = useState(INITIAL_FORM);

  const handleChange = (field: keyof typeof INITIAL_FORM) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const openPicker = (e: MouseEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
      } catch {
        // Ignore: some browsers throw if the picker can't be shown (e.g. not user-triggered)
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const message = `New Booking Request:
Name: ${form.name}
WhatsApp: ${form.phone}
Pickup: ${form.pickup}
Drop-off: ${form.dropoff}
Date: ${form.date}
Time: ${form.time}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/971566625302?text=${encodedMessage}`, "_blank");

    try {
      await submitInquiry({
        name: form.name,
        phone: form.phone,
        pickup_location: form.pickup,
        dropoff_location: form.dropoff,
        date: form.date,
        time: form.time,
      });
    } catch (error) {
      console.error(error);
    }

    setForm(INITIAL_FORM);
  };

  return (
    <section id="contact" className="py-20 md:py-28 bg-[#030712]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!hideHeading && (
          <>
            <p className="text-emerald-500 text-xs font-semibold tracking-[0.2em] uppercase">
              Contact Us
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white tracking-tight">
              Book Your Ride
            </h2>
            <p className="text-gray-400 text-base mt-4 max-w-xl">
              Fill in the details below and we&apos;ll get back to you instantly
              on WhatsApp.
            </p>
          </>
        )}

        <div
          className={`grid grid-cols-1 lg:grid-cols-5 gap-12 ${
            hideHeading ? "" : "mt-14"
          }`}
        >
          {/* Left column: Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            {CONTACT_ITEMS.map(({ Icon, title, content }) => (
              <div key={title} className="flex gap-4">
                <Icon size={20} className="text-emerald-500 shrink-0" />
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  {content}
                </div>
              </div>
            ))}

            <div className="rounded-xl overflow-hidden border border-white/5 h-56">
              <iframe
                src={MAP_EMBED_SRC}
                title="Office location map"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full border-0 grayscale-[40%] contrast-125 opacity-90"
              />
            </div>
          </div>

          {/* Right column: Booking Form */}
          <div className="lg:col-span-3 bg-[#0F172A] border border-white/5 rounded-xl p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange("name")}
                  className={inputClasses}
                />
              </div>

              <div className="mb-5">
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+971 50 123 4567"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter pickup location"
                    value={form.pickup}
                    onChange={handleChange("pickup")}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Drop-off Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter drop-off location"
                    value={form.dropoff}
                    onChange={handleChange("dropoff")}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={handleChange("date")}
                    onClick={openPicker}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={form.time}
                    onChange={handleChange("time")}
                    onClick={openPicker}
                    className={inputClasses}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                Book Now via WhatsApp
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
