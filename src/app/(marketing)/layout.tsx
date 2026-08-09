import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

// Public pages read services/routes/fleet/posts from Supabase. Without this they
// are rendered once at build time, so dashboard edits never reach production
// (revalidatePath in the server actions only clears the cache of the server that
// ran it — localhost, not Vercel). Re-render at most once a minute instead.
export const revalidate = 60;

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <WhatsAppButton />
    </>
  );
}
