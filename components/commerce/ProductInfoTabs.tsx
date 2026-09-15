"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { parseDescription } from "@/lib/products/description";
import type { ProductAttribute } from "@/lib/shopify/types";

/**
 * Description / Product details, as two tabs under the purchase block.
 *
 * The two answer different questions. The description is read once, to decide whether this is
 * the right product; the data sheet is scanned, usually to check one figure against something
 * the shopper already owns. Stacking both meant the specs sat below a paragraph nobody rereads.
 *
 * The details tab is built from the product's filterable attributes, so it fills itself: add
 * Length or Weight in EchoDesk and a row appears here with no code change. When a product has
 * no attributes the tab is not rendered at all — an empty "Product details" heading is worse
 * than none, and most of the catalogue has nothing to put there yet.
 */
export function ProductInfoTabs({
  description,
  attributes,
}: {
  description: string;
  attributes?: ProductAttribute[];
}) {
  const t = useTranslations("product");
  const baseId = useId();
  const blocks = parseDescription(description);
  const specs = (attributes ?? []).filter((a) => a.values.length > 0);
  const hasSpecs = specs.length > 0;
  const [tab, setTab] = useState<"description" | "details">("description");

  if (blocks.length === 0 && !hasSpecs) return null;

  const tabs = [
    { id: "description" as const, label: t("description"), enabled: blocks.length > 0 },
    { id: "details" as const, label: t("productDetails"), enabled: hasSpecs },
  ].filter((x) => x.enabled);

  // One tab is not a tab — it is a heading, and a lone clickable tab invites a click that
  // does nothing.
  const single = tabs.length === 1;
  const active = tabs.some((x) => x.id === tab) ? tab : tabs[0].id;

  return (
    <div className="mt-8 border-t border-black/10 pt-6">
      <div
        role={single ? undefined : "tablist"}
        className="flex gap-6 border-b border-black/10"
      >
        {tabs.map((x) => {
          const on = x.id === active;
          return single ? (
            <p key={x.id} className="label-eyebrow pb-2.5">
              {x.label}
            </p>
          ) : (
            <button
              key={x.id}
              type="button"
              role="tab"
              id={`${baseId}-${x.id}`}
              aria-selected={on}
              aria-controls={`${baseId}-${x.id}-panel`}
              onClick={() => setTab(x.id)}
              className={cn(
                "label-eyebrow -mb-px cursor-pointer border-b-2 pb-2.5 transition-colors",
                on
                  ? "border-[var(--color-brand-ink)] opacity-100"
                  : "border-transparent opacity-55 hover:opacity-85",
              )}
            >
              {x.label}
            </button>
          );
        })}
      </div>

      {active === "description" && blocks.length > 0 ? (
        <div
          role={single ? undefined : "tabpanel"}
          id={`${baseId}-description-panel`}
          aria-labelledby={single ? undefined : `${baseId}-description`}
          className="mt-5 grid max-w-prose gap-3 text-sm leading-relaxed opacity-85"
        >
          {blocks.map((b, i) =>
            b.kind === "paragraph" ? (
              <p key={i}>{b.text}</p>
            ) : (
              <ul key={i} className="grid list-disc gap-1.5 pl-5 marker:opacity-45">
                {b.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            ),
          )}
        </div>
      ) : null}

      {active === "details" && hasSpecs ? (
        <div
          role={single ? undefined : "tabpanel"}
          id={`${baseId}-details-panel`}
          aria-labelledby={single ? undefined : `${baseId}-details`}
          className="mt-5"
        >
          {/* A definition list, not a table: these are label/value pairs, and `dl` says so to
              a screen reader without the row-and-column semantics a table would promise.
              Zebra striping carries the pairing across the gap on wide screens. */}
          <dl className="grid text-sm">
            {specs.map((a, i) => (
              <div
                key={a.key}
                className={cn(
                  "grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4 px-3 py-2.5",
                  i % 2 === 0 ? "bg-black/[0.035]" : undefined,
                )}
              >
                <dt className="opacity-65">{a.name}</dt>
                <dd className="m-0">{a.values.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </div>
  );
}
