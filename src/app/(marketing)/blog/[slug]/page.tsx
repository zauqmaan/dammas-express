import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, MessageCircle } from "lucide-react";
import { getPostBySlug, getPublishedPosts } from "@/lib/data";
import { formatDate } from "@/lib/format";

interface BlogArticlePageProps {
  params: { slug: string };
}

const WHATSAPP_URL =
  "https://wa.me/971566625302?text=Hi%2C%20I%20want%20to%20book%20a%20ride";

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.created_at,
    },
  };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="pt-32 pb-20 bg-[#030712]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Blog
        </Link>

        {post.image_url && (
          <div className="mt-2 mb-8">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-xl border border-white/5"
            />
          </div>
        )}

        <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full">
          {post.category}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 mt-6 text-gray-500 text-sm">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {formatDate(post.created_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            5 min read
          </span>
        </div>

        <div className="border-t border-white/5 mt-8 mb-10" />

        <div
          className="prose prose-invert prose-sm md:prose-base max-w-none
          prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
          prose-p:text-gray-400 prose-p:leading-relaxed
          prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
          prose-li:text-gray-400
          prose-strong:text-white"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-16 p-8 bg-[#0F172A] border border-white/5 rounded-xl text-center">
          <h2 className="text-xl font-bold text-white">Need a Reliable Ride?</h2>
          <p className="text-gray-400 mt-2">
            Book your transportation service today.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            <MessageCircle size={18} />
            Book Now via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
