"use client";

import { Instagram } from "lucide-react";
import { useOverlays } from "@/lib/ui/overlays";

export function InstagramFloater() {
  const handle = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "nitchiani";
  const { pdpCtaActive } = useOverlays();
  return (
    <a
      href={`https://instagram.com/${handle}`}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`Follow @${handle} on Instagram`}
      aria-hidden={pdpCtaActive}
      // Stacks above WhatsAppFloater. On mobile we add 64px (the BottomNav) + safe-area inset.
      // Hides while the PDP sticky Add-to-bag bar is up (paired with WhatsAppFloater).
      className="fixed right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 sm:bottom-22"
      style={{
        bottom: "calc(9.5rem + env(safe-area-inset-bottom))",
        background:
          "linear-gradient(135deg,#feda75,#fa7e1e 25%,#d62976 50%,#962fbf 75%,#4f5bd5)",
        color: "white",
        opacity: pdpCtaActive ? 0 : 1,
        pointerEvents: pdpCtaActive ? "none" : "auto",
        transform: pdpCtaActive ? "translateY(20px) scale(0.9)" : undefined,
      }}
    >
      <Instagram size={22} />
    </a>
  );
}
