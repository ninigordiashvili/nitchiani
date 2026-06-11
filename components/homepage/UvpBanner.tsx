"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Full-bleed brand UVP banner that appears once and is gone after the user engages.
 *
 *   - Visible only on the visitor's first session (gated server-side by the `uvp-seen`
 *     cookie — see `app/[locale]/(shop)/page.tsx`). No SSR flash on return visits.
 *   - Dismisses once the user has fully scrolled past the banner (its bottom edge has
 *     passed the top of the viewport). Sets the cookie + unmounts itself.
 *   - Cookie lasts 1 year. Users who clear cookies see it again on next visit — fine.
 *
 * Server keeps deciding whether to mount the banner at all; this component only handles
 * the in-session dismissal once mounted.
 */

const COOKIE_NAME = "uvp-seen";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
const ENTER_DURATION_MS = 900;
const EXIT_DURATION_MS = 750;
// Softer settling curve than `--ease-brand` — closer to "ease-out-expo" with a long
// decel tail so the motion feels editorial rather than mechanical.
const SMOOTH_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
// Tall enough to cover the banner's actual height on any viewport; max-height transitions
// only work between explicit values, so we pick a generous ceiling and animate down to 0.
const COLLAPSE_FROM_PX = 600;

export function UvpBanner() {
  const t = useTranslations("home");
  // Three-phase lifecycle: mounted (off → on for enter animation), dismissing (on → off
  // for exit animation), dismissed (unmount).
  const [mounted, setMounted] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Trigger the enter animation on the frame after mount, so the initial paint shows the
  // banner offset/transparent and the transition runs from there.
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
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
  const visible = mounted && !dismissing;
  const transitionDuration = dismissing ? EXIT_DURATION_MS : ENTER_DURATION_MS;

  return (
    <section
      ref={sectionRef}
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
      <div className="container-shop py-20 text-center sm:py-24">
        <h2
          className="font-display leading-tight tracking-wider uppercase"
          style={{ fontSize: "54px" }}
        >
          {t("uvp")}
        </h2>
      </div>
    </section>
  );
}
