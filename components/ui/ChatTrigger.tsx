"use client";

import { openChatWidget } from "@/lib/ui/chat-widget";

/**
 * Button that opens the on-site chat widget, styled entirely by the caller so it can sit in
 * a PDP card, a menu row, or anywhere else without carrying its own look.
 *
 * `fallbackHref` covers the case where the widget hasn't mounted — local dev, a slow script,
 * an ad blocker. Without it the CTA would be silently dead in exactly the situations where a
 * customer most needs to reach someone, so we hand them a real channel instead.
 */
export function ChatTrigger({
  className,
  style,
  fallbackHref,
  onOpen,
  children,
  ...rest
}: {
  className?: string;
  style?: React.CSSProperties;
  /** Where to send the user if the widget isn't available. */
  fallbackHref: string;
  /** Fires after either path runs — e.g. to close the menu the button lives in. */
  onOpen?: () => void;
  children: React.ReactNode;
} & React.AriaAttributes) {
  return (
    <button
      type="button"
      onClick={() => {
        if (!openChatWidget()) {
          window.open(fallbackHref, "_blank", "noopener,noreferrer");
        }
        onOpen?.();
      }}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </button>
  );
}
