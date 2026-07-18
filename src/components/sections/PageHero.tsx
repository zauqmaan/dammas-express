import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PageHeroProps {
  title: string;
  description: string;
  currentPage: string;
}

export default function PageHero({ title, description, currentPage }: PageHeroProps) {
  return (
    <section
      className="py-28 md:py-28"
      style={{
        background:
          "radial-gradient(ellipse at top right, rgba(16,185,129,0.08) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(245,158,11,0.05) 0%, transparent 50%), #030712",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/" className="text-gray-500 hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight size={12} className="text-gray-700" />
          <span className="text-emerald-400 font-medium">{currentPage}</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mt-6">
          {title}
        </h1>
        <p className="text-gray-400 text-lg mt-4 max-w-2xl">{description}</p>
      </div>
    </section>
  );
}
