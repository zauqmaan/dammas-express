import PageHero from "@/components/sections/PageHero";
import BlogCard from "@/components/ui/BlogCard";
import { getPublishedPosts } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Car Lift & Commuting Blog — Dubai",
  description: "Tips, guides, and news about transportation services across the UAE.",
  path: "/blog",
});

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <PageHero
        title="Car Lift & Commuting Insights for Dubai"
        description="Tips, guides, and news about transportation across the UAE."
        currentPage="Blog"
      />

      <section className="py-20 bg-[#030712]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
