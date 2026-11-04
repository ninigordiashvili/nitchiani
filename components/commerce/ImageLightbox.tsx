"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { BLUR_DATA_URL } from "@/lib/images";
import type { ImageRef } from "@/lib/shopify/types";
import { useFocusTrap } from "@/lib/ui/use-focus-trap";
import { cn } from "@/lib/utils";

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const SLIDE_MS = 240;

type Point = { x: number; y: number };

/**
 * Full-screen product photo viewer, the way Temu and Amazon open a tapped photo.
 *
 * - Pinch (two fingers) or the mouse wheel zooms up to 4×, towards the fingers or cursor.
 * - Double-tap / double-click toggles between fitted and 2.5×, at the point tapped.
 * - Dragging pans while zoomed; while not zoomed, a sideways swipe changes photo and a
 *   downward swipe closes.
 * - Arrow keys change photo, Escape closes.
 *
 * Gestures run on pointer events, so one code path serves touch, pen and mouse, with
 * `touch-action: none` keeping the browser from scrolling or zooming the page underneath.
 */
export function ImageLightbox({
  images,
  index,
  title,
  onIndexChange,
  onClose,
}: {
  images: ImageRef[];
  index: number;
  title: string;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const t = useTranslations("product");
  const tNav = useTranslations("nav");
  const dialogRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [animate, setAnimate] = useState(true);

  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<{
    startScale: number;
    startOffset: Point;
    startDist: number;
    startMid: Point;
    start: Point;
    moved: boolean;
    /** Which way a one-finger drag at 1× has committed to, so a diagonal wobble can't tilt the photo. */
    axis: "x" | "y" | null;
  } | null>(null);
  /** True from a swipe's release until the photo has settled, so a second swipe can't pile on. */
  const sliding = useRef(false);
  const lastTap = useRef<{ time: number; at: Point } | null>(null);

  const count = images.length;
  const current = images[index] ?? images[0];

  const reset = useCallback(() => {
    setAnimate(true);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  /**
   * Move to the neighbouring photo with the slide the swipe started: the strip travels one
   * stage-width, and only then does the index change, with the strip put back at rest in the
   * same render so nothing jumps. Without this the photo was swapped the instant a finger
   * lifted, which read as a glitch rather than a swipe.
   */
  const go = useCallback(
    (dir: 1 | -1) => {
      if (count < 2 || sliding.current) return;
      sliding.current = true;
      const w = stageRef.current?.getBoundingClientRect().width ?? window.innerWidth;
      setAnimate(true);
      setScale(1);
      setOffset({ x: -dir * w, y: 0 });
      window.setTimeout(() => {
        setAnimate(false);
        onIndexChange((index + dir + count) % count);
        setOffset({ x: 0, y: 0 });
        sliding.current = false;
        // Transitions come back on after the reset has painted, not with it.
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
      }, SLIDE_MS);
    },
    [count, index, onIndexChange],
  );

  // Keyboard, and the page behind kept still while the viewer is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [go, onClose]);

  /** A point relative to the stage's centre — the origin the transform scales around. */
  const fromCentre = (clientX: number, clientY: number): Point => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: clientX - (r.left + r.width / 2), y: clientY - (r.top + r.height / 2) };
  };

  /** Keeps the zoomed photo from being dragged off the stage. */
  const clamp = (o: Point, s: number): Point => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r || s <= 1) return { x: 0, y: 0 };
    const maxX = ((s - 1) * r.width) / 2;
    const maxY = ((s - 1) * r.height) / 2;
    return { x: Math.max(-maxX, Math.min(maxX, o.x)), y: Math.max(-maxY, Math.min(maxY, o.y)) };
  };

  /** Zoom to `next`, keeping the content under point `p` (from centre) where it is. */
  const zoomAt = (next: number, p: Point, from = { scale, offset }) => {
    const s = Math.max(1, Math.min(MAX_SCALE, next));
    const ratio = s / from.scale;
    const o = { x: p.x - (p.x - from.offset.x) * ratio, y: p.y - (p.y - from.offset.y) * ratio };
    setScale(s);
    setOffset(clamp(o, s));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (sliding.current) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setAnimate(false);
    const pts = [...pointers.current.values()];
    const mid = pts.length === 2 ? { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 } : pts[0];
    gesture.current = {
      startScale: scale,
      startOffset: offset,
      startDist: pts.length === 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0,
      startMid: mid,
      start: { x: e.clientX, y: e.clientY },
      moved: false,
      axis: null,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const pts = [...pointers.current.values()];

    if (pts.length === 2 && g.startDist > 0) {
      g.moved = true;
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      zoomAt(g.startScale * (dist / g.startDist), fromCentre(mid.x, mid.y), {
        scale: g.startScale,
        offset: g.startOffset,
      });
      return;
    }

    if (sliding.current) return;
    const dx = e.clientX - g.start.x;
    const dy = e.clientY - g.start.y;
    if (Math.hypot(dx, dy) > 6) g.moved = true;
    if (scale > 1) {
      setOffset(clamp({ x: g.startOffset.x + dx, y: g.startOffset.y + dy }, scale));
      return;
    }
    // Not zoomed: commit to one axis after a few pixels and stay on it.
    if (!g.axis && Math.hypot(dx, dy) > 8) g.axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
    if (g.axis === "x") {
      // With nothing to swipe to, the photo gives a little and no more.
      setOffset({ x: count > 1 ? dx : dx * 0.25, y: 0 });
    } else if (g.axis === "y") {
      // A downward drag follows the finger, as a hint that letting go closes.
      setOffset({ x: 0, y: Math.max(0, dy) });
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    setAnimate(true);
    if (!g) return;

    // A second finger lifting ends a pinch; carry on as a one-finger drag from here.
    if (pointers.current.size === 1) {
      const [rest] = [...pointers.current.values()];
      gesture.current = { ...g, startScale: scale, startOffset: offset, startDist: 0, start: rest, moved: true, axis: null };
      return;
    }
    gesture.current = null;

    const dx = e.clientX - g.start.x;
    const dy = e.clientY - g.start.y;

    if (!g.moved) {
      // Double tap / double click: toggle zoom at the tapped point.
      const now = Date.now();
      const at = { x: e.clientX, y: e.clientY };
      const prev = lastTap.current;
      if (prev && now - prev.time < 300 && Math.hypot(at.x - prev.at.x, at.y - prev.at.y) < 30) {
        lastTap.current = null;
        if (scale > 1) reset();
        else zoomAt(DOUBLE_TAP_SCALE, fromCentre(at.x, at.y));
      } else {
        lastTap.current = { time: now, at };
      }
      return;
    }

    if (scale <= 1) {
      const w = stageRef.current?.getBoundingClientRect().width ?? window.innerWidth;
      if (g.axis === "y" && dy > 100) return onClose();
      if (g.axis === "x" && count > 1 && Math.abs(dx) > Math.min(60, w * 0.15)) {
        go(dx < 0 ? 1 : -1);
        return;
      }
      setOffset({ x: 0, y: 0 });
    } else if (scale < 1.05) {
      reset();
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    setAnimate(false);
    zoomAt(scale * Math.exp(-e.deltaY * 0.0025), fromCentre(e.clientX, e.clientY));
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      // React events bubble through portals to the component that opened the viewer. The
      // quick view closes on a downward swipe, so touches stop here.
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: "color-mix(in oklab, var(--color-brand-ink) 94%, transparent)" }}
    >
      <div className="flex h-14 flex-shrink-0 items-center justify-between px-4 text-[var(--color-brand-cream)]">
        <span className="text-sm tabular-nums opacity-80">
          {count > 1 ? `${index + 1} / ${count}` : ""}
        </span>
        <span className="hidden text-xs opacity-60 sm:inline">{t("zoomHelp")}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label={tNav("close")}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full hover:bg-white/10"
        >
          <X size={22} />
        </button>
      </div>

      <div
        ref={stageRef}
        className={cn("relative min-h-0 flex-1 overflow-hidden", scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in")}
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transition: animate ? "transform 220ms var(--ease-brand, ease-out)" : "none",
            willChange: "transform",
          }}
        >
          {/* The neighbours wait one stage-width either side, already loaded, so a swipe
              brings the next photo in with the finger instead of swapping it afterwards. */}
          {count > 1 && scale <= 1 ? (
            <>
              <Slide image={images[(index - 1 + count) % count]} title={title} at="-100%" />
              <Slide image={images[(index + 1) % count]} title={title} at="100%" />
            </>
          ) : null}
          <Slide image={current} title={title} at="0" priority />
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => go(-1)}
              aria-label={t("prevImage")}
              className="absolute top-1/2 left-3 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[var(--color-brand-ink)] shadow-lg hover:bg-white sm:flex"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => go(1)}
              aria-label={t("nextImage")}
              className="absolute top-1/2 right-3 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[var(--color-brand-ink)] shadow-lg hover:bg-white sm:flex"
            >
              <ChevronRight size={22} />
            </button>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <ul className="no-scrollbar flex flex-shrink-0 justify-center-safe gap-2 overflow-x-auto px-4 py-3">
          {images.map((img, i) => (
            <li key={`${img.url}-${i}`}>
              <button
                type="button"
                onClick={() => {
                  reset();
                  onIndexChange(i);
                }}
                aria-label={tNav("showImage", { n: i + 1 })}
                className={cn(
                  "relative h-14 w-14 flex-shrink-0 cursor-pointer overflow-hidden rounded bg-white transition-opacity",
                  i === index ? "ring-2 ring-[var(--color-brand-cream)]" : "opacity-60 hover:opacity-100",
                )}
              >
                <Image src={img.url} alt="" fill sizes="56px" className="object-contain" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>,
    document.body,
  );
}

/** One photo in the strip, parked `at` an offset from the stage's centre position. */
const Slide = memo(function Slide({
  image,
  title,
  at,
  priority = false,
}: {
  image: ImageRef;
  title: string;
  at: string;
  priority?: boolean;
}) {
  return (
    <div className="absolute inset-0" style={{ transform: `translateX(${at})` }} aria-hidden={at !== "0"}>
      <Image
        src={image.url}
        alt={image.altText || title}
        fill
        sizes="100vw"
        quality={90}
        loading="eager"
        priority={priority}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        className="pointer-events-none object-contain select-none"
        draggable={false}
      />
    </div>
  );
});
