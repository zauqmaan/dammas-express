import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "@/lib/supabase/types";
import { formatDate } from "@/lib/format";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-[#0F172A] border border-white/5 rounded-xl overflow-hidden hover:border-emerald-500/20 transition-all duration-300"
    >
      <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
        {post.image_url ? (
          <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-700 text-sm font-medium">{post.category}</span>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between">
          <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full">
            {post.category}
          </span>
          <span className="text-gray-600 text-xs">{formatDate(post.created_at)}</span>
        </div>

        <h3 className="text-white font-bold text-lg mt-3 group-hover:text-emerald-400 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-500 text-sm mt-2 line-clamp-2">{post.excerpt}</p>

        <div className="mt-4 flex items-center gap-1 text-emerald-500 text-sm font-medium">
          Read More
          <ArrowRight size={16} />
        </div>
      </div>
    </Link>
  );
}
