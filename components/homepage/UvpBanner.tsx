"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

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
        __html: `if(document.cookie.split("; ").indexOf("${COOKIE_NAME}=1")>-1)document.documentElement.classList.add("uvp-seen")`,
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
      <div className="container-shop py-10 text-center sm:py-24">
        <h2 className="font-display text-[32px] leading-tight tracking-wider uppercase sm:text-[54px]">
          {t("uvp")}
        </h2>
      </div>
    </section>
    </>
  );
}
