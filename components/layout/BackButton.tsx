"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/routing";

/**
 * Small inline "← Back" link rendered directly under the header on every page except the
 * locale root. Georgian shoppers expect a visible back affordance independent of the browser
 * chrome (mobile Safari hides its toolbar on scroll, in-app browsers vary).
 *
 * Uses `router.back()` when there's prior history; otherwise pushes to home so a cold-landed
 * tab doesn't drop the user back to the previous external page.
 */
export function BackButton() {
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();

  // Hide on the homepage and on every category/collection page reachable via the chips
  // (`/shop`, `/shop/best-sellers`, `/shop/bonnets`, …) — those pages already have the
  // CategoryChips strip immediately under the header, so a separate "Back" link is noise.
  if (pathname === "/" || pathname === "/shop" || pathname.startsWith("/shop/")) return null;

  const onClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="container-shop py-4 sm:py-5">
      <button
        type="button"
        onClick={onClick}
        className="-ml-1 inline-flex cursor-pointer items-center gap-1.5 bg-transparent text-sm text-black/60 transition-colors hover:text-black/90"
      >
        <ArrowLeft size={16} />
        {t("back")}
      </button>
    </div>
  );
}
