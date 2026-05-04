"use client";

const WHATSAPP_ICON_PATH =
  "M19.077 4.928A9.953 9.953 0 0 0 12.011 2c-5.508 0-9.997 4.479-10 9.984a9.93 9.93 0 0 0 1.337 4.985L2 22l5.205-1.314a9.99 9.99 0 0 0 4.798 1.221h.004c5.505 0 9.989-4.479 9.992-9.984a9.92 9.92 0 0 0-2.922-7.075m-7.067 15.357h-.003a8.3 8.3 0 0 1-4.232-1.158l-.304-.18-3.155.794.842-3.062-.198-.314a8.26 8.26 0 0 1-1.276-4.428c0-4.572 3.731-8.293 8.328-8.293a8.27 8.27 0 0 1 5.888 2.434 8.21 8.21 0 0 1 2.439 5.866c-.002 4.572-3.733 8.341-8.329 8.341m4.565-6.218c-.25-.125-1.482-.731-1.711-.815-.23-.084-.397-.125-.563.125-.166.249-.646.815-.792.981s-.291.187-.541.062c-.249-.125-1.057-.39-2.013-1.242-.745-.664-1.247-1.485-1.394-1.734-.146-.249-.016-.384.109-.508.112-.111.249-.291.374-.436.125-.146.166-.249.249-.415.083-.166.041-.311-.021-.436s-.563-1.354-.771-1.854c-.203-.487-.408-.42-.563-.428a10 10 0 0 0-.479-.009.92.92 0 0 0-.668.312c-.229.249-.875.852-.875 2.077s.896 2.408 1.021 2.574c.125.166 1.768 2.696 4.282 3.778a14 14 0 0 0 1.428.526c.6.19 1.146.163 1.578.099.482-.072 1.482-.605 1.69-1.19.209-.583.209-1.083.146-1.187s-.229-.166-.479-.291";

export function WhatsAppFloater() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "995555000000";
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
      <svg
        viewBox="0 0 24 24"
        width={28}
        height={28}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d={WHATSAPP_ICON_PATH} />
      </svg>
    </a>
  );
}
