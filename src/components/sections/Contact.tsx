"use client";

import { useState, type FormEvent, type ChangeEvent, type MouseEvent } from "react";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { submitInquiry } from "@/lib/data";

const OFFICE_ADDRESS = "Al falasi building 2nd floor 201 office, Dubai, UAE";

const CONTACT_ITEMS = [
  {
    Icon: MapPin,
    title: "Our Office",
    content: (
      <>
        <p className="text-gray-400 text-sm mt-1">{OFFICE_ADDRESS}</p>
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

// Google geocodes buildings, not floors — "2nd floor 201 office" only throws the
// match off, and several Dubai buildings share the "Al Falasi" name. Keep this
// query to what is actually locatable. For an exact pin, replace it with the
// coordinates from Google Maps (right-click the building > copy the "25.2xx,
// 55.3xx" pair), which take priority over any name lookup.
const MAP_QUERY = "Al Falasi Building, Dubai, UAE";
const MAP_EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(
  MAP_QUERY
)}&z=17&output=embed`;

const INITIAL_FORM = {
  name: "",
  phone: "",
  pickup: "",
  dropoff: "",
  date: "",
  time: "",
  companyName: "",
  employeeCount: "",
  workTimings: "",
};

type ServiceType = "individual" | "corporate";

const inputClasses =
  "w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors";

interface ContactProps {
  /** Skip the section heading when the page already has one (e.g. the /contact page hero). */
  hideHeading?: boolean;
}

export default function Contact({ hideHeading = false }: ContactProps) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [serviceType, setServiceType] = useState<ServiceType>("individual");

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

    const isCorporate = serviceType === "corporate";

    const message = isCorporate
      ? `🏢 *NEW CORPORATE LEAD - Dammas Express*

👤 Contact: ${form.name}
📱 Phone: ${form.phone}
🏢 Company: ${form.companyName}
👥 Employees: ${form.employeeCount}
📍 Pickup Areas: ${form.pickup}
⏰ Timings: ${form.workTimings}`
      : `🚗 *New Booking Request - Dammas Express*

👤 Name: ${form.name}
📱 WhatsApp: ${form.phone}
📍 Pickup: ${form.pickup}
🏁 Drop-off: ${form.dropoff}
📅 Date: ${form.date}
🕐 Time: ${form.time}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/971566625302?text=${encodedMessage}`, "_blank");

    try {
      await submitInquiry({
        service_type: serviceType,
        name: form.name,
        phone: form.phone,
        pickup_location: form.pickup,
        dropoff_location: isCorporate ? null : form.dropoff,
        date: isCorporate ? null : form.date,
        time: isCorporate ? null : form.time,
        company_name: isCorporate ? form.companyName : null,
        employee_count: isCorporate ? Number(form.employeeCount) : null,
        work_timings: isCorporate ? form.workTimings : null,
      });
    } catch (error) {
      console.error(error);
    }

    setForm(INITIAL_FORM);
    setServiceType("individual");
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
              <label className="text-sm font-medium text-gray-300 mb-3 block">
                I am looking for
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setServiceType("individual")}
                  aria-pressed={serviceType === "individual"}
                  className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                    serviceType === "individual"
                      ? "bg-emerald-500/10 border-emerald-500/50 text-white"
                      : "bg-[#030712] border-white/5 text-gray-400 hover:border-white/20"
                  }`}
                >
                  <p className="font-semibold text-sm">👤 Individual Passenger</p>
                  <p className="text-xs mt-1 opacity-70">
                    Daily or monthly car lift pass
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setServiceType("corporate")}
                  aria-pressed={serviceType === "corporate"}
                  className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                    serviceType === "corporate"
                      ? "bg-amber-500/10 border-amber-500/50 text-white"
                      : "bg-[#030712] border-white/5 text-gray-400 hover:border-white/20"
                  }`}
                >
                  <p className="font-semibold text-sm">
                    🏢 Corporate / HR Contract
                  </p>
                  <p className="text-xs mt-1 opacity-70">
                    Staff transport for companies
                  </p>
                </button>
              </div>

              {serviceType === "corporate" && (
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., ABC Construction LLC"
                      value={form.companyName}
                      onChange={handleChange("companyName")}
                      className={inputClasses}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="HR Manager name"
                        value={form.name}
                        onChange={handleChange("name")}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Phone *
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
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Number of Employees *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g., 25"
                      value={form.employeeCount}
                      onChange={handleChange("employeeCount")}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Pickup Locations *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Deira, Bur Dubai, Karama"
                      value={form.pickup}
                      onChange={handleChange("pickup")}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Work Timings *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 7 AM to 5 PM"
                      value={form.workTimings}
                      onChange={handleChange("workTimings")}
                      className={inputClasses}
                    />
                  </div>
                </div>
              )}

              {serviceType === "individual" && (
                <div className="space-y-5">
                  <div>
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

                  <div>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                </div>
              )}

              <button
                type="submit"
                className={`w-full mt-6 text-white font-semibold py-3.5 rounded-lg transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 ${
                  serviceType === "corporate"
                    ? "bg-amber-500 hover:bg-amber-600 hover:shadow-amber-500/25"
                    : "bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-500/25"
                }`}
              >
                <MessageCircle size={18} />
                {serviceType === "corporate"
                  ? "Request Corporate Quote"
                  : "Book Now via WhatsApp"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
