const STATS: { number: string; symbol: string; symbolColor: string; label: string }[] = [
  { number: "500", symbol: "+", symbolColor: "text-emerald-500", label: "Happy Customers" },
  { number: "50", symbol: "+", symbolColor: "text-emerald-500", label: "Fleet Vehicles" },
  { number: "5", symbol: "★", symbolColor: "text-amber-500", label: "Customer Rating" },
  { number: "24", symbol: "/7", symbolColor: "text-emerald-500", label: "Service Available" },
];

export default function StatsBar() {
  return (
    <section className="py-12 md:py-16 bg-[#0F172A] border-t border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ number, symbol, symbolColor, label }) => (
            <div key={label} className="text-center">
              <span className="text-white font-bold text-3xl md:text-4xl">
                {number}
              </span>
              <span className={`${symbolColor} font-bold text-3xl md:text-4xl`}>
                {symbol}
              </span>
              <p className="text-sm text-gray-500 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
