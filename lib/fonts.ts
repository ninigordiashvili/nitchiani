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
 *
 * What is preloaded is the body text of each script, and nothing else. All six files used to be
 * preloaded on every page in both languages — 164 KB at the highest priority the browser has,
 * of which 107 KB was Georgian the English reader never renders, or Latin the Georgian reader
 * never renders. The display faces are two headings per page and can arrive with `swap`.
 */

export const manrope = Manrope({
  // Latin-ext covers Central European diacritics this shop's copy never uses; dropping it
  // saves 15 KB of the preloaded weight.
  subsets: ["latin"],
  display: "swap",
  variable: "--font-latin-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const tenorSans = Tenor_Sans({
  subsets: ["latin"],
  display: "swap",
  // Display face: the wordmark and a few headings. Swapped in when it lands.
  preload: false,
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
  // The largest file of the six, 65 KB, for headings only.
  preload: false,
  variable: "--font-georgian-display",
  weight: ["400", "500"],
});
