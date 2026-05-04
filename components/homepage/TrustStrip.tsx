import { CreditCard, RotateCcw, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * Trust signals (shipping · returns · secure payment).
 *
 * Originally lived on the homepage; now used in the footer (dark tone) and the PDP (light tone).
 *
 * - tone="light" → cream surface (default). Cream icon circles, ink text, hairline borders.
 * - tone="dark"  → teal-black surface. White/10 icon circles, cream text, no outer borders.
 * - layout="row"     → 1 col on mobile, 3 cols on sm+. (Default)
 * - layout="column"  → always stacked, used in narrow column contexts like the PDP sidebar.
 */
export function TrustStrip({
  tone = "light",
  layout = "row",
}: {
  tone?: "light" | "dark";
  layout?: "row" | "column";
} = {}) {
  const t = useTranslations("home.trust");
  const items = [
    { icon: <Truck size={20} />, title: t("shipping"), desc: t("shippingDesc") },
    { icon: <RotateCcw size={20} />, title: t("returns"), desc: t("returnsDesc") },
    { icon: <CreditCard size={20} />, title: t("payment"), desc: t("paymentDesc") },
  ];

  const isDark = tone === "dark";
  const containerCls = cn(
    "grid gap-4 py-6",
    layout === "row" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1",
    !isDark && "border-y border-black/10",
  );

  return (
    <ul className={containerCls}>
      {items.map((it, i) => (
        <li key={i} className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={
              isDark
                ? { background: "rgba(255,255,255,0.08)", color: "var(--color-brand-cream)" }
                : { background: "var(--color-brand-cream-2)" }
            }
          >
            {it.icon}
          </span>
          <div>
            <p
              className="text-sm font-medium leading-tight"
              style={isDark ? { color: "var(--color-brand-cream)" } : undefined}
            >
              {it.title}
            </p>
            <p
              className="text-xs"
              style={
                isDark
                  ? { color: "var(--color-brand-silver)", opacity: 0.85 }
                  : { opacity: 0.6 }
              }
            >
              {it.desc}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
