import type { Route } from "@/lib/supabase/types";
import RouteCard from "@/components/ui/RouteCard";

interface RoutesProps {
  data: Route[];
}

export default function Routes({ data }: RoutesProps) {
  return (
    <section id="routes" className="py-20 md:py-28 bg-[#030712]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-emerald-500 text-xs font-semibold tracking-[0.2em] uppercase">
            Popular Routes
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white tracking-tight">
            Fixed Pricing Across Dubai
          </h2>
          <p className="text-gray-400 text-base mt-4 max-w-2xl mx-auto">
            Transparent fares with no hidden charges. Know your price before you
            ride.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {data.map((route) => (
            <RouteCard key={route.id} {...route} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm">
            Need a custom route?{" "}
            <a
              href="#contact"
              className="text-emerald-500 hover:text-emerald-400 text-sm font-medium underline underline-offset-4 decoration-emerald-500/30 hover:decoration-emerald-400 transition-colors"
            >
              Contact us for pricing
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
