"use client";

import { getWhatsAppNumber, WhatsAppIcon } from "@/components/brand/WhatsAppIcon";

export function WhatsAppFloater() {
  const number = getWhatsAppNumber();
  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Chat on WhatsApp"
      // Sits 88px above the bottom on mobile to clear the BottomNav (and its iOS safe area);
      // settles back to 16px on sm+ where the bottom nav is hidden.
      className="fixed right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 sm:bottom-4"
      style={{
        bottom: "calc(5.5rem + env(safe-area-inset-bottom))",
        background: "#25D366",
        color: "white",
      }}
    >
      <WhatsAppIcon size={28} />
    </a>
  );
}
