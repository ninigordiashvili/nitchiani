"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * Compact share link for the PDP. Tap behaviour:
 *  - Mobile (or any browser with Web Share API): opens the native share sheet — WhatsApp,
 *    Instagram Stories, SMS, etc. in one tap. This is the primary path for IG-driven
 *    traffic who want to send the product to a friend.
 *  - Desktop fallback (no `navigator.share`): copies the canonical URL to clipboard and
 *    flashes a "Link copied" confirmation.
 *
 * `url` accepts a relative path; the component prepends `window.location.origin` at click
 * time so the shared link is always absolute and crawlable.
 */
export function ShareButton({
  title,
  url,
  className,
}: {
  title: string;
  url: string;
  className?: string;
}) {
  const t = useTranslations("product");
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const fullUrl = url.startsWith("http")
      ? url
      : typeof window !== "undefined"
        ? `${window.location.origin}${url}`
        : url;

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, url: fullUrl });
        return;
      } catch (err) {
        // User dismissed the native share sheet → don't fall through to copy.
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (very rare); no further fallback.
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t("share")}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 text-[11px] underline-offset-2 hover:underline",
        copied ? "opacity-100" : "opacity-70 hover:opacity-100",
        className,
      )}
    >
      {copied ? (
        <Check size={13} style={{ color: "var(--color-brand-maroon)" }} />
      ) : (
        <Share2 size={13} />
      )}
      <span>{copied ? t("shareCopied") : t("share")}</span>
    </button>
  );
}
