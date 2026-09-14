// GA4 loader. Renders nothing until NEXT_PUBLIC_GA_ID is set, so the site can
// ship before the measurement ID exists without a broken script tag or a
// console error in production.
//
// Set the ID in .env.local for local testing and in the Vercel project's
// environment variables for production:
//   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

import Script from "next/script";
import { GA_ID } from "@/lib/analytics";

export default function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      {/* afterInteractive so the measurement snippet never blocks first paint. */}
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
