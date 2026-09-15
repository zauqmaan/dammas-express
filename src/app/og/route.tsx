// Renders the site-wide Open Graph card at a fixed URL (/og), 1200x630.
//
// A route handler rather than the `opengraph-image` file convention because the
// file convention appends a content hash to the URL, which means it cannot be
// referenced from src/lib/seo.ts. A stable path lets every page declare
// og:image explicitly instead of relying on how Next merges nested metadata.

import { ImageResponse } from "next/og";
import { BUSINESS, HOURS, OG_IMAGE } from "@/lib/seo";

// The edge runtime is required, not a preference. Under the Node runtime
// @vercel/og resolves its bundled font and WASM through fileURLToPath, which
// throws "TypeError: Invalid URL" on Windows paths and fails the build while
// prerendering this route. The edge bundle inlines those assets instead.
//
// ImageResponse already sends a long immutable cache-control in production, so
// the card is still generated once and then served from the CDN.
export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#030712",
          // Emerald glow bottom-left, matching the site's accent.
          backgroundImage:
            "radial-gradient(900px 500px at 8% 100%, rgba(16,185,129,0.20), transparent 70%)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            color: "#34d399",
            fontSize: 28,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "9999px",
              backgroundColor: "#34d399",
            }}
          />
          {/* Wrapped rather than left as a bare text node: satori wants every
              child of a flex container to be an element. */}
          <div style={{ display: "flex" }}>
            Morning &amp; Evening Shifts, {HOURS.serviceDaysShort}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "36px",
            color: "#ffffff",
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          Al Quoz Car Lift &amp; Staff Transport
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "28px",
            color: "#9ca3af",
            fontSize: 34,
            lineHeight: 1.35,
          }}
        >
          Monthly passes from AED 250 — Deira, Bur Dubai, Karama, Rigga &amp; Abu Hail
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: "48px",
            color: "#ffffff",
            fontSize: 32,
            fontWeight: 600,
          }}
        >
          <div style={{ display: "flex" }}>{BUSINESS.legalName}</div>
          <div style={{ display: "flex", color: "#34d399" }}>{BUSINESS.phoneDisplay}</div>
        </div>
      </div>
    ),
    { width: OG_IMAGE.width, height: OG_IMAGE.height }
  );
}
