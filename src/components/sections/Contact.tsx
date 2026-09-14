"use client";

import { useId, useState, type FormEvent, type ChangeEvent, type MouseEvent } from "react";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { submitInquiry } from "@/lib/data";
import { BUSINESS, HOURS } from "@/lib/seo";
import { trackContactClick, trackLead } from "@/lib/analytics";
import CitySkyline from "@/components/graphics/CitySkyline";

const CONTACT_ITEMS = [
  {
    Icon: MapPin,
    title: "Our Office",
    content: (
      <>
        <p className="text-gray-400 text-sm mt-1">{BUSINESS.addressFull}</p>
        <p className="text-gray-500 text-xs mt-1">📍 We serve all Emirates</p>
      </>
    ),
  },
  {
    Icon: Phone,
    title: "Phone / WhatsApp",
    content: (
      <a
        href={`tel:${BUSINESS.phone}`}
        onClick={() => trackContactClick("phone", "contact_section")}
        className="text-white font-medium text-sm mt-1 inline-block hover:text-emerald-400 transition-colors"
      >
        {BUSINESS.phoneDisplay}
      </a>
    ),
  },
  {
    Icon: Mail,
    title: "Email",
    content: (
      <a
        href={`mailto:${BUSINESS.email}`}
        onClick={() => trackContactClick("email", "contact_section")}
        className="text-white font-medium text-sm mt-1 inline-block hover:text-emerald-400 transition-colors"
      >
        {BUSINESS.email}
      </a>
    ),
  },
  {
    Icon: Clock,
    title: "Working Hours",
    content: (
      <>
        <p className="text-gray-400 text-sm mt-1">
          Bookings &amp; enquiries: {HOURS.contact}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Rides run {HOURS.serviceDays} — morning {HOURS.morning}, evening{" "}
          {HOURS.evening}
        </p>
      </>
    ),
  },
];

// Google geocodes buildings, not floors — "2nd floor 201 office" only throws the
// match off, and several Dubai buildings share the "Al Falasi" name. Keep this
// query to what is actually locatable; it is deliberately shorter than
// BUSINESS.addressFull and is never shown as text. For an exact pin, replace it
// with the coordinates from Google Maps (right-click the building > copy the
// "25.2xx, 55.3xx" pair), which take priority over any name lookup.
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

type Status = { type: "idle" | "success" | "error"; message: string };

const IDLE: Status = { type: "idle", message: "" };

const inputClasses =
  "w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors";

const labelClasses = "text-sm font-medium text-gray-300 mb-2 block";

interface ContactProps {
  /** Skip the section heading when the page already has one (e.g. the /contact page hero). */
  hideHeading?: boolean;
}

export default function Contact({ hideHeading = false }: ContactProps) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [serviceType, setServiceType] = useState<ServiceType>("individual");
  const [status, setStatus] = useState<Status>(IDLE);
  const [submitting, setSubmitting] = useState(false);

  // This component renders on /, /contact and /booking, so ids must be unique
  // per instance rather than hardcoded — otherwise two copies on one page would
  // collide and every label would point at the first form's fields.
  const uid = useId();
  const fieldId = (name: string) => `${uid}-${name}`;

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
    setSubmitting(true);
    setStatus(IDLE);

    const isCorporate = serviceType === "corporate";

    // Drop-off is optional — Al Quoz is where essentially every booking goes,
    // so an empty field means the default rather than missing information.
    const dropoff = form.dropoff.trim() || "Al Quoz";

    const message = isCorporate
      ? `🏢 *NEW CORPORATE LEAD - Dammas Express*

👤 Contact: ${form.name}
📱 Phone: ${form.phone}
🏢 Company: ${form.companyName}
👥 Employees: ${form.employeeCount || "Not specified"}
📍 Pickup Areas: ${form.pickup}
⏰ Timings: ${form.workTimings || "Not specified"}`
      : `🚗 *New Booking Request - Dammas Express*

👤 Name: ${form.name}
📱 WhatsApp: ${form.phone}
📍 Pickup: ${form.pickup}
🏁 Drop-off: ${dropoff}
📅 Date: ${form.date || "Flexible"}
🕐 Time: ${form.time || "Flexible"}`;

    const encodedMessage = encodeURIComponent(message);
    // Opened synchronously inside the click handler so the browser still
    // attributes it to the user gesture. A null return means it was blocked.
    const waTab = window.open(
      `${BUSINESS.whatsapp}?text=${encodedMessage}`,
      "_blank"
    );

    try {
      await submitInquiry({
        service_type: serviceType,
        name: form.name,
        phone: form.phone,
        pickup_location: form.pickup,
        dropoff_location: isCorporate ? null : dropoff,
        date: isCorporate ? null : form.date || null,
        time: isCorporate ? null : form.time || null,
        company_name: isCorporate ? form.companyName : null,
        employee_count:
          isCorporate && form.employeeCount ? Number(form.employeeCount) : null,
        work_timings: isCorporate ? form.workTimings || null : null,
      });

      trackLead(serviceType);

      setStatus({
        type: "success",
        message: waTab
          ? "Thanks — we've got your request and opened WhatsApp so you can send it straight through."
          : `Thanks — we've got your request. Your browser blocked the WhatsApp tab, so message us on ${BUSINESS.phoneDisplay} to confirm.`,
      });
      setForm(INITIAL_FORM);
      setServiceType("individual");
    } catch (error) {
      // The request previously failed silently: window.open fired, the insert
      // threw into a console.error, and the form reset as if it had worked.
      console.error(error);
      setStatus({
        type: "error",
        message: `We couldn't save your request. Please WhatsApp or call us on ${BUSINESS.phoneDisplay} and we'll sort it out.`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden py-20 md:py-28 bg-[#030712]">
      {/* Ambient art: the skyline sits low and full-width so the form above it
          stays the focus */}
      <CitySkyline className="pointer-events-none select-none hidden md:block absolute -bottom-6 -left-8 w-[120%] max-w-none opacity-[0.07] animate-sway-x" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              {/* A fieldset/legend rather than a bare label: these are two
                  toggle buttons, not a labellable form control. */}
              <fieldset className="mb-6">
                <legend className="text-sm font-medium text-gray-300 mb-3">
                  I am looking for
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              </fieldset>

              {serviceType === "corporate" && (
                <div className="space-y-5">
                  <div>
                    <label htmlFor={fieldId("company-name")} className={labelClasses}>
                      Company Name *
                    </label>
                    <input
                      id={fieldId("company-name")}
                      name="companyName"
                      type="text"
                      required
                      autoComplete="organization"
                      placeholder="e.g., ABC Construction LLC"
                      value={form.companyName}
                      onChange={handleChange("companyName")}
                      className={inputClasses}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={fieldId("contact-person")} className={labelClasses}>
                        Contact Person *
                      </label>
                      <input
                        id={fieldId("contact-person")}
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="HR Manager name"
                        value={form.name}
                        onChange={handleChange("name")}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label htmlFor={fieldId("corporate-phone")} className={labelClasses}>
                        Phone *
                      </label>
                      <input
                        id={fieldId("corporate-phone")}
                        name="phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        placeholder="+971 50 123 4567"
                        value={form.phone}
                        onChange={handleChange("phone")}
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor={fieldId("employee-count")} className={labelClasses}>
                      Number of Employees
                    </label>
                    <input
                      id={fieldId("employee-count")}
                      name="employeeCount"
                      type="number"
                      min="1"
                      placeholder="e.g., 25"
                      value={form.employeeCount}
                      onChange={handleChange("employeeCount")}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label htmlFor={fieldId("corporate-pickup")} className={labelClasses}>
                      Pickup Locations *
                    </label>
                    <input
                      id={fieldId("corporate-pickup")}
                      name="pickup"
                      type="text"
                      required
                      placeholder="e.g., Deira, Bur Dubai, Karama"
                      value={form.pickup}
                      onChange={handleChange("pickup")}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label htmlFor={fieldId("work-timings")} className={labelClasses}>
                      Work Timings
                    </label>
                    <input
                      id={fieldId("work-timings")}
                      name="workTimings"
                      type="text"
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
                    <label htmlFor={fieldId("name")} className={labelClasses}>
                      Full Name *
                    </label>
                    <input
                      id={fieldId("name")}
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={handleChange("name")}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label htmlFor={fieldId("phone")} className={labelClasses}>
                      WhatsApp Number *
                    </label>
                    <input
                      id={fieldId("phone")}
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      placeholder="+971 50 123 4567"
                      value={form.phone}
                      onChange={handleChange("phone")}
                      className={inputClasses}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor={fieldId("pickup")} className={labelClasses}>
                        Pickup Location *
                      </label>
                      <input
                        id={fieldId("pickup")}
                        name="pickup"
                        type="text"
                        required
                        placeholder="Enter pickup location"
                        value={form.pickup}
                        onChange={handleChange("pickup")}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label htmlFor={fieldId("dropoff")} className={labelClasses}>
                        Drop-off Location
                      </label>
                      <input
                        id={fieldId("dropoff")}
                        name="dropoff"
                        type="text"
                        placeholder="Al Quoz (default)"
                        value={form.dropoff}
                        onChange={handleChange("dropoff")}
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor={fieldId("date")} className={labelClasses}>
                        Date
                      </label>
                      <input
                        id={fieldId("date")}
                        name="date"
                        type="date"
                        value={form.date}
                        onChange={handleChange("date")}
                        onClick={openPicker}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label htmlFor={fieldId("time")} className={labelClasses}>
                        Time
                      </label>
                      <input
                        id={fieldId("time")}
                        name="time"
                        type="time"
                        value={form.time}
                        onChange={handleChange("time")}
                        onClick={openPicker}
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    Only name, number and pickup are needed — leave the rest blank
                    and we&apos;ll confirm the details with you.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={`w-full mt-6 text-white font-semibold py-3.5 rounded-lg transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                  serviceType === "corporate"
                    ? "bg-amber-500 hover:bg-amber-600 hover:shadow-amber-500/25"
                    : "bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-500/25"
                }`}
              >
                <MessageCircle size={18} />
                {submitting
                  ? "Sending…"
                  : serviceType === "corporate"
                  ? "Request Corporate Quote"
                  : "Book Now via WhatsApp"}
              </button>

              {/* aria-live so screen readers announce the outcome — the form
                  used to reset silently whether it succeeded or failed. */}
              <p
                role="status"
                aria-live="polite"
                className={`mt-4 text-sm min-h-[1.25rem] ${
                  status.type === "error" ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {status.message}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
