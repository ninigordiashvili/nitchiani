"use client";

import { Instagram } from "lucide-react";

export function InstagramFloater() {
  const handle = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "nitchiani";
  return (
    <a
      href={`https://instagram.com/${handle}`}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`Follow @${handle} on Instagram`}
      // Stacks above WhatsAppFloater. On mobile we add 64px (the BottomNav) + safe-area inset.
      className="fixed right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 sm:bottom-22"
      style={{
        bottom: "calc(9.5rem + env(safe-area-inset-bottom))",
        background:
          "linear-gradient(135deg,#feda75,#fa7e1e 25%,#d62976 50%,#962fbf 75%,#4f5bd5)",
        color: "white",
      }}
    >
      <Instagram size={22} />
    </a>
  );
}
