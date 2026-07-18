import { MessageCircle, Phone } from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/971566625302?text=Hi%2C%20I%20want%20to%20book%20a%20ride";

export default function CTABanner() {
  return (
    <section className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-[#0F172A] to-amber-500/5 border border-emerald-500/20 rounded-2xl p-10 md:p-16 text-center">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
            aria-hidden="true"
          />

          <div className="relative">
            <p className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase">
              Get Started Today
            </p>
            <h2 className="mt-4 max-w-3xl mx-auto text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Ready to Ride with Dubai&apos;s Most Trusted Transport?
            </h2>
            <p className="mt-5 text-gray-400 text-lg">
              Join 500+ happy customers. Book your first ride or get a custom
              quote in seconds.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/25"
              >
                <MessageCircle size={20} />
                Book Your Ride
              </a>
              <a
                href="tel:+971566625302"
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl font-medium transition-all"
              >
                <Phone size={20} />
                Call Us Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
