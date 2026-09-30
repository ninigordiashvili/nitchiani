import { cn } from "@/lib/utils";

/**
 * Visa and Mastercard marks, shown wherever the site says it takes cards. Acquirers ask for
 * the logos themselves, not the names in text, before switching a merchant to live payments.
 *
 * Each mark sits on its own white tile, the way card brands are shown at checkouts: the
 * brands' colours are fixed and can't be recoloured, so the tile gives them the white
 * ground they're drawn for on both the dark footer and the light checkout.
 *
 * Visa: the wordmark from Simple Icons (simple-icons.org), in Visa blue.
 * Mastercard: the two-circle symbol in the brand's red, yellow and orange overlap.
 */
export function CardBrandLogos({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  const tile = cn(
    "flex items-center justify-center rounded-[4px] bg-white ring-1 ring-black/10",
    size === "sm" ? "h-6 w-10 px-1.5" : "h-7 w-12 px-2",
  );
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className={tile}>
        <svg role="img" aria-label="Visa" viewBox="0 8.2 24 7.6" className="h-full w-full">
          <path
            fill="#1A1F71"
            d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"
          />
        </svg>
      </span>
      <span className={tile}>
        <svg role="img" aria-label="Mastercard" viewBox="0 0 39 24" className="h-full w-full py-0.5">
          <circle cx="12" cy="12" r="12" fill="#EB001B" />
          <circle cx="27" cy="12" r="12" fill="#F79E1B" />
          <path fill="#FF5F00" d="M19.5 2.633A12 12 0 0 1 19.5 21.367A12 12 0 0 1 19.5 2.633Z" />
        </svg>
      </span>
    </div>
  );
}
