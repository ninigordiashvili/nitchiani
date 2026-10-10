"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

/**
 * Full-bleed brand UVP banner that appears once and is gone after the user engages.
 *
 *   - Visible only on the visitor's first session. The `uvp-seen` cookie is checked by a tiny
 *     inline script before the page paints, so a returning visitor never sees it flash — and
 *     the server doesn't need the cookie, which keeps the home page cacheable.
 *   - Shown at full opacity from the first paint: it's the largest thing above the fold, so
 *     fading it in held back the moment the page counts as loaded.
 *   - Dismisses once the user has fully scrolled past the banner (its bottom edge has
 *     passed the top of the viewport). Sets the cookie + unmounts itself.
 *   - Cookie lasts 1 year. Users who clear cookies see it again on next visit — fine.
 *
 */

const COOKIE_NAME = "uvp-seen";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
const EXIT_DURATION_MS = 750;
// Softer settling curve than `--ease-brand` — closer to "ease-out-expo" with a long
// decel tail so the motion feels editorial rather than mechanical.
const SMOOTH_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
// Tall enough to cover the banner's actual height on any viewport; max-height transitions
// only work between explicit values, so we pick a generous ceiling and animate down to 0.
const COLLAPSE_FROM_PX = 600;

export function UvpBanner() {
  const t = useTranslations("home");
  const locale = useLocale();
  // Two-phase lifecycle: shown, then dismissing (fades and collapses) once scrolled past,
  // then dismissed (unmounted).
  const [dismissing, setDismissing] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Already seen (the inline script has hidden it): unmount rather than keep it in the page.
  useEffect(() => {
    if (document.cookie.split("; ").includes(`${COOKIE_NAME}=1`)) setDismissed(true);
  }, []);

  // Dismiss once the banner has fully scrolled off the top — i.e., its bottom edge is
  // at or above the top of the viewport. `IntersectionObserver` is the right primitive
  // here: rather than reading `scrollY` and comparing against a static threshold, we let
  // the browser tell us "the element no longer intersects the viewport at the top".
  useEffect(() => {
    if (dismissing) return;
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // `bottom <= 0` means the entire banner is above the viewport.
          // We also accept the `isIntersecting` false signal as a secondary check.
          if (!entry.isIntersecting && entry.boundingClientRect.bottom <= 0) {
            try {
              document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
            } catch {
              // best-effort — quota / private mode etc.
            }
            setDismissing(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [dismissing]);

  useEffect(() => {
    if (!dismissing) return;
    // Match the longest concurrent transition (the height collapse, which is the
    // `EXIT_DURATION_MS + 100ms + 50ms delay`). Adds a tiny buffer so we don't unmount
    // mid-frame and cause a visible snap.
    const id = window.setTimeout(() => setDismissed(true), EXIT_DURATION_MS + 200);
    return () => window.clearTimeout(id);
  }, [dismissing]);

  if (dismissed) return null;

  // Three properties animate together:
  //   opacity   — primary feel cue
  //   transform — short downward settle on enter, upward lift on exit
  //   max-height — collapses the section to zero during exit so the page below glides
  //                up instead of snapping when the unmount happens
  const visible = !dismissing;
  const transitionDuration = EXIT_DURATION_MS;

  return (
    <>
    {/* Runs as the HTML is parsed, before paint: a returning visitor's banner is hidden
        without ever showing. */}
    <script
      dangerouslySetInnerHTML={{
        // A data attribute, not a class: React owns <html>'s className, and changing it
        // before hydration is a mismatch it reports in the console.
        __html: `if(document.cookie.split("; ").indexOf("${COOKIE_NAME}=1")>-1)document.documentElement.setAttribute("data-uvp-seen","1")`,
      }}
    />
    <section
      ref={sectionRef}
      data-uvp-banner=""
      aria-hidden={dismissing}
      style={{
        background: "var(--color-brand-bg)",
        color: "var(--color-brand-cream)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-20px)",
        // Only collapse the height during exit. On mount we keep the natural height so
        // the enter animation is purely opacity + transform (no scroll-anchor wobble).
        maxHeight: dismissing ? 0 : `${COLLAPSE_FROM_PX}px`,
        overflow: "hidden",
        transition: [
          `opacity ${transitionDuration}ms ${SMOOTH_EASE}`,
          `transform ${transitionDuration}ms ${SMOOTH_EASE}`,
          // Slight delay on the height collapse so the fade-out leads and the height
          // glide finishes a touch after — feels more "settling" than "snapping".
          `max-height ${transitionDuration + 100}ms ${SMOOTH_EASE} 50ms`,
        ].join(", "),
        willChange: "opacity, transform, max-height",
      }}
    >
      {/* A breath of light from the top edge, so the band reads as a lit surface rather than
          a flat block of teal. Barely there by design — 6% of cream. */}
      <div
        className="container-shop relative py-12 text-center sm:py-24"
        style={{
          backgroundImage:
            "radial-gradient(70% 120% at 50% -10%, color-mix(in oklab, var(--color-brand-cream) 7%, transparent), transparent 65%)",
        }}
      >
        <p className="text-[10px] font-medium tracking-[0.42em] uppercase opacity-55 sm:text-[11px]">
          Nitchiani
        </p>
        {/* A hairline between the mark and the line it introduces: the pause that makes the
            two read as one composition rather than two stacked sentences. */}
        <span
          aria-hidden
          className="mx-auto mt-4 mb-5 block h-px w-8 sm:mt-5 sm:mb-6 sm:w-10"
          style={{ background: "color-mix(in oklab, var(--color-brand-cream) 30%, transparent)" }}
        />
        {/* Georgian has no capitals and takes letter-spacing badly — spread out, the serif
            loses the joins that make it elegant. So the wide-tracked uppercase treatment is
            kept for the English line, and the Georgian one is set tight and large instead,
            which is where that script looks its best. */}
        <h2
          className={
            locale === "ka"
              ? "font-display mx-auto max-w-[17ch] text-[30px] leading-[1.16] tracking-[-0.01em] text-balance sm:text-[52px] sm:leading-[1.08]"
              : "font-display mx-auto max-w-[20ch] text-[26px] leading-[1.2] tracking-[0.12em] uppercase text-balance sm:text-[42px] sm:leading-[1.15] sm:tracking-[0.16em]"
          }
        >
          {t("uvp")}
        </h2>
      </div>
    </section>
    </>
  );
}
