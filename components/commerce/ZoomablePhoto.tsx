"use client";

import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { BLUR_DATA_URL } from "@/lib/images";
import type { ImageRef } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

/** How far the photo magnifies under the cursor — enough to read texture and ends. */
const HOVER_ZOOM = 2.5;

/** Past this many pixels sideways a touch is a swipe, not a tap that wandered. */
const SWIPE_MIN = 40;

/**
 * A product photo that zooms: under the cursor on a computer (Amazon-style), and into the
 * full-screen viewer on click or tap. Shared by the product page and the quick view, so the
 * two behave the same.
 *
 * `children` are overlaid on the photo (thumbnails, a close button); clicks on them don't
 * open the viewer.
 *
 * Given `onNavigate`, the photo also steps through its gallery in place — arrows on a pointer
 * device, a swipe on a touch one — so the shots can be compared without the viewer at all.
 */
export function ZoomablePhoto({
  image,
  alt,
  sizes,
  priority = false,
  className,
  imageClassName,
  hintPosition = "bottom-right",
  onOpen,
  onNavigate,
  children,
}: {
  image: ImageRef;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  /** Where the "hover/tap to zoom" hint sits, clear of whatever else overlays the photo. */
  hintPosition?: "bottom-right" | "top-left";
  onOpen: () => void;
  /** Step to the next (+1) or previous (-1) shot. Omitted when there is only one. */
  onNavigate?: (delta: 1 | -1) => void;
  children?: React.ReactNode;
}) {
  const t = useTranslations("product");
  /** Cursor position over the photo, in percent — the point the hover zoom magnifies. */
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  /** The sharp copy is fetched on first hover and kept; this marks which photo it has loaded. */
  const [sharpWanted, setSharpWanted] = useState(false);
  const [sharpReadyFor, setSharpReadyFor] = useState<string | null>(null);
  const sharpReady = sharpReadyFor === image.url;
  // Hover zoom only where there's a real hover: a mouse or trackpad. On touch, a tap opens
  // the full-screen viewer instead, where pinch does the zooming.
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const zoomStyle: React.CSSProperties | undefined =
    canHover && hover
      ? { transform: `scale(${HOVER_ZOOM})`, transformOrigin: `${hover.x}% ${hover.y}%` }
      : undefined;

  /** True when the event started on an overlaid control rather than the photo itself. */
  const fromControl = (target: EventTarget) =>
    target instanceof Element && target.closest("button, a") !== null;

  // A swipe ends in a click too, and a click here opens the full-screen viewer. So a swipe
  // that actually moved the gallery swallows the click it leaves behind.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={t("zoomOpen")}
      onClick={(e) => {
        if (swiped.current) {
          swiped.current = false;
          return;
        }
        if (!fromControl(e.target)) onOpen();
      }}
      onTouchStart={(e) => {
        swiped.current = false;
        touchStart.current =
          e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
      }}
      onTouchEnd={(e) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start || !onNavigate || fromControl(e.target)) return;
        const dx = e.changedTouches[0].clientX - start.x;
        const dy = e.changedTouches[0].clientY - start.y;
        // Sideways, and more sideways than down: a vertical drag is the page scrolling.
        if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) <= Math.abs(dy)) return;
        swiped.current = true;
        onNavigate(dx < 0 ? 1 : -1);
      }}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
        if (onNavigate && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
          e.preventDefault();
          onNavigate(e.key === "ArrowRight" ? 1 : -1);
        }
      }}
      onMouseMove={(e) => {
        if (!canHover || fromControl(e.target)) return setHover(null);
        const r = e.currentTarget.getBoundingClientRect();
        setHover({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      onMouseEnter={() => {
        if (canHover) setSharpWanted(true);
      }}
      onMouseLeave={() => setHover(null)}
      className={cn("group/photo relative cursor-zoom-in overflow-hidden bg-white", className)}
    >
      {/* The photo on screen zooms itself, so the zoom starts the instant the cursor arrives.
          It used to wait under a white layer for a sharper copy to download, which showed as
          a white flash the first time each photo was hovered. */}
      <Image
        src={image.url}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        className={cn("object-contain", imageClassName)}
        style={zoomStyle}
      />
      {/* The sharper copy for 2.5×: fetched on first hover, kept afterwards, and only shown
          once it has loaded — until then the photo above is what's zoomed. */}
      {canHover && sharpWanted ? (
        <Image
          src={image.url}
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          quality={90}
          onLoad={() => setSharpReadyFor(image.url)}
          className="pointer-events-none object-contain transition-opacity duration-200"
          style={{ ...zoomStyle, opacity: hover && sharpReady ? 1 : 0 }}
        />
      ) : null}
      {/* Tells a shopper the photo does something; hidden while already zoomed. */}
      <span
        className={cn(
          "pointer-events-none absolute flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-[var(--color-brand-ink)] shadow-sm transition-opacity",
          hintPosition === "top-left" ? "top-3 left-3" : "right-3 bottom-3",
          hover ? "opacity-0" : "opacity-100",
        )}
      >
        <ZoomIn size={13} aria-hidden />
        {canHover ? t("zoomHintHover") : t("zoomHintTap")}
      </span>
      {/* Pointer devices only: on a touch screen the swipe above does this, and an arrow would
          just cover the photo. */}
      {onNavigate ? (
        <>
          <PhotoArrow side="left" label={t("prevImage")} onClick={() => onNavigate(-1)} />
          <PhotoArrow side="right" label={t("nextImage")} onClick={() => onNavigate(1)} />
        </>
      ) : null}
      {children}
    </div>
  );
}

function PhotoArrow({
  side,
  label,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        // The photo itself opens the viewer on click; stepping through it must not.
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      className={cn(
        "absolute top-1/2 hidden h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[var(--color-brand-ink)] opacity-0 shadow-sm transition-opacity hover:bg-white focus-visible:opacity-100 group-hover/photo:opacity-100 sm:flex",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      {side === "left" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
    </button>
  );
}
