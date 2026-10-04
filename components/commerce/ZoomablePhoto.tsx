"use client";

import { ZoomIn } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BLUR_DATA_URL } from "@/lib/images";
import type { ImageRef } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

/** How far the photo magnifies under the cursor — enough to read texture and ends. */
const HOVER_ZOOM = 2.5;

/**
 * A product photo that zooms: under the cursor on a computer (Amazon-style), and into the
 * full-screen viewer on click or tap. Shared by the product page and the quick view, so the
 * two behave the same.
 *
 * `children` are overlaid on the photo (thumbnails, a close button); clicks on them don't
 * open the viewer.
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

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={t("zoomOpen")}
      onClick={(e) => {
        if (!fromControl(e.target)) onOpen();
      }}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
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
      className={cn("relative cursor-zoom-in overflow-hidden bg-white", className)}
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
      {children}
    </div>
  );
}
