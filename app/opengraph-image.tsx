import { ImageResponse } from "next/og";

/**
 * Site-wide default OpenGraph / Twitter card image, generated at the edge.
 *
 * Lives at the app root so Next attaches it to every route's `og:image` and `twitter:image`
 * automatically — pages that set their own `openGraph.images` in `generateMetadata`
 * (products, services, campaigns) override this for their route. Brand palette mirrors the
 * CSS tokens in `globals.css`: teal-black background, cream wordmark, maroon accent.
 *
 * The strapline stays in Latin script for both locales. Satori renders this at the edge from
 * the fonts it is handed, and the built-in stack has no Georgian glyphs — a Georgian line
 * would come out as boxes on every share. Setting one would mean fetching a Georgian face as
 * an ArrayBuffer here; worth doing if the card is ever aimed at Georgian social specifically.
 */
export const alt = "Nitchiani — Synthetic hair, curls & loc care · Tbilisi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a1f1f",
          color: "#f5efe6",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 120, letterSpacing: "-0.03em", fontWeight: 600 }}>
          Nitchiani
        </div>
        <div
          style={{
            width: 120,
            height: 6,
            backgroundColor: "#a14040",
            marginTop: 28,
            marginBottom: 36,
          }}
        />
        <div style={{ fontSize: 36, opacity: 0.85, letterSpacing: "0.01em" }}>
          Synthetic hair, curls &amp; loc care · Tbilisi
        </div>
      </div>
    ),
    size,
  );
}
