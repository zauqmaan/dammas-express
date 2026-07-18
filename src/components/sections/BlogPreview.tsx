import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "@/lib/supabase/types";
import BlogCard from "@/components/ui/BlogCard";

interface BlogPreviewProps {
  data: BlogPost[];
}

export default function BlogPreview({ data }: BlogPreviewProps) {
  return (
    <section className="py-20 md:py-28 bg-[#030712] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-emerald-500 text-xs font-semibold tracking-[0.2em] uppercase">
            Latest Insights
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white tracking-tight">
            From Our Blog
          </h2>
          <p className="text-gray-400 text-base mt-4 max-w-2xl mx-auto">
            Tips, guides, and news about transportation in the UAE.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {data.slice(0, 3).map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="text-emerald-500 hover:text-emerald-400 text-sm font-medium inline-flex items-center gap-1"
          >
            View All Articles
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
