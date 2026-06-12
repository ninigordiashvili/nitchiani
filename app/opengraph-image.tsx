import { ImageResponse } from "next/og";

/**
 * Site-wide default OpenGraph / Twitter card image, generated at the edge.
 *
 * Lives at the app root so Next attaches it to every route's `og:image` and `twitter:image`
 * automatically — pages that set their own `openGraph.images` in `generateMetadata`
 * (products, services, campaigns) override this for their route. Brand palette mirrors the
 * CSS tokens in `globals.css`: teal-black background, cream wordmark, maroon accent.
 */
export const alt = "Nitchiani — Premium braids, locs & haircare · Tbilisi";
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
          Premium braids, locs &amp; haircare · Tbilisi
        </div>
      </div>
    ),
    size,
  );
}
