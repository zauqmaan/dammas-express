"use client";

import Link from "next/link";
import { MessageCircle, Phone, Mail, MapPin, Clock } from "lucide-react";
import { BUSINESS, HOURS } from "@/lib/seo";
import { trackContactClick } from "@/lib/analytics";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Routes", href: "/routes" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Booking", href: "/booking" },
  { label: "Contact", href: "/contact" },
];

// Only profiles the business actually maintains. This list previously held four
// href="#" placeholders (Facebook, Instagram, Twitter, Youtube) which rendered
// as focusable links that went nowhere. Add a real profile here *and* to
// `sameAs` in src/components/seo/JsonLd.tsx so the connection is machine-
// readable too — two or three active accounts beat six abandoned ones.
const SOCIALS = [
  { label: "WhatsApp", href: BUSINESS.whatsapp, Icon: MessageCircle },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#030712]">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Column 1: Logo + tagline + socials */}
          <div>
            <img src="/images/logo.png" alt="Dammas Express" className="h-14 w-auto" />
            <p className="mt-3 text-sm text-gray-400 leading-relaxed max-w-xs">
              Trusted daily and monthly car lift services to Al Quoz from
              Deira, Bur Dubai, Karama, Rigga &amp; Abuhail, reliable pick &amp;
              drop for staff and daily commuters.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  onClick={() => trackContactClick("whatsapp", "footer")}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-white/5 text-gray-400 hover:text-white hover:border-emerald-500/20 transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info — the full postal address, phone and email
              appear site-wide here, worded identically to the LocalBusiness
              JSON-LD and the contact section. All three read from BUSINESS. */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-5">
              Contact Info
            </h3>
            <address className="not-italic">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-400 leading-relaxed">
                    {BUSINESS.addressFull}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-emerald-500 shrink-0" />
                  <a
                    href={`tel:${BUSINESS.phone}`}
                    onClick={() => trackContactClick("phone", "footer")}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {BUSINESS.phoneDisplay}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-emerald-500 shrink-0" />
                  <a
                    href={`mailto:${BUSINESS.email}`}
                    onClick={() => trackContactClick("email", "footer")}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {BUSINESS.email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Clock size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-400 leading-relaxed">
                    Contact {HOURS.contact}
                    <br />
                    {HOURS.serviceSummary}
                  </span>
                </li>
              </ul>
            </address>
          </div>

          {/* Column 4: Booking CTA */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-5">
              Book Your Ride
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Get a quote for your next lift and travel with total peace of
              mind.
            </p>
            <Link
              href="/booking"
              className="inline-flex bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-all"
            >
              Book Now
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} {BUSINESS.legalName}. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">Made with ❤️ in UAE</p>
        </div>
      </div>
    </footer>
  );
}
