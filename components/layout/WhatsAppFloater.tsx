"use client";

import { getWhatsAppNumber, WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { useOverlays } from "@/lib/ui/overlays";

export function WhatsAppFloater() {
  const number = getWhatsAppNumber();
  const { pdpCtaActive } = useOverlays();
  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Chat on WhatsApp"
      aria-hidden={pdpCtaActive}
      // Sits 88px above the bottom on mobile to clear the BottomNav (and its iOS safe area);
      // settles back to 16px on sm+ where the bottom nav is hidden. Fades out while the
      // PDP sticky Add-to-bag bar is active so it doesn't crowd that bar's right edge.
      className="fixed right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 sm:bottom-4"
      style={{
        bottom: "calc(5.5rem + env(safe-area-inset-bottom))",
        background: "#25D366",
        color: "white",
        opacity: pdpCtaActive ? 0 : 1,
        pointerEvents: pdpCtaActive ? "none" : "auto",
        transform: pdpCtaActive ? "translateY(20px) scale(0.9)" : undefined,
      }}
    >
      <WhatsAppIcon size={28} />
    </a>
  );
}
