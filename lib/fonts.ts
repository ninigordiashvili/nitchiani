import {
  Manrope,
  Noto_Sans_Georgian,
  Noto_Serif_Georgian,
  Tenor_Sans,
} from "next/font/google";

/**
 * Latin display + body fonts (Tenor Sans, Manrope) and Georgian counterparts (Noto Serif/Sans
 * Georgian). next/font auto-subsets and self-hosts each at build time.
 *
 * Browsers fall through font-family stacks per-glyph: Latin chars render via Manrope/Tenor Sans
 * (which lack Georgian glyphs), Georgian chars fall through to the Noto pair. globals.css declares
 * the stacks via the CSS variables wired here.
 */

export const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-latin-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const tenorSans = Tenor_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-latin-display",
  weight: ["400"],
});

export const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ["georgian"],
  display: "swap",
  variable: "--font-georgian-sans",
  weight: ["400", "500", "600", "700"],
});

export const notoSerifGeorgian = Noto_Serif_Georgian({
  subsets: ["georgian"],
  display: "swap",
  variable: "--font-georgian-display",
  weight: ["400", "500"],
});
