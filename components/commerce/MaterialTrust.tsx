import { ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { findMaterial } from "@/lib/piercings";
import type { Locale } from "@/lib/i18n/config";

/**
 * Material trust panel for piercing PDPs. Pulls from the `lib/piercings.ts` materials
 * registry given a handle (typically `product.material`). Renders nothing if the handle
 * doesn't resolve — safe to drop into any PDP unconditionally; non-piercings just no-op.
 *
 * Layout:
 *   ┌──────────────────────────────────────┐
 *   │ ⛨  Implant-grade titanium            │
 *   │    ASTM F-136 (ISO 5832-3)           │
 *   │                                      │
 *   │    The gold standard for fresh ...   │
 *   │                                      │
 *   │    · Safe for actively healing ...   │
 *   │    · Nickel-free, hypoallergenic     │
 *   │    · Surgical-implant grade alloy    │
 *   │                                      │
 *   │    ⚠ For healed piercings only (if applicable)
 *   └──────────────────────────────────────┘
 */
export async function MaterialTrust({
  materialHandle,
  locale,
}: {
  materialHandle: string | undefined;
  locale: Locale;
}) {
  const material = findMaterial(materialHandle);
  if (!material) return null;

  const t = await getTranslations("piercings");
  const ka = locale === "ka";
  const name = ka ? material.nameKa : material.nameEn;
  const claim = ka ? material.claimKa : material.claimEn;
  const certification = ka ? material.certificationKa : material.certificationEn;
  const bullets = ka ? material.bulletsKa : material.bulletsEn;

  return (
    <section
      aria-label={t("materialPanelAria")}
      className="mt-6 flex gap-3 rounded-md border border-black/10 p-4 sm:p-5"
      style={{ background: "var(--surface-elevated)" }}
    >
      <ShieldCheck
        size={18}
        className="mt-0.5 flex-shrink-0"
        style={{ color: "var(--color-brand-maroon)" }}
      />
      <div className="min-w-0 flex-1">
        <p className="label-eyebrow mb-1">{t("materialEyebrow")}</p>
        <p className="text-sm font-medium">{name}</p>
        {certification ? (
          <p className="mt-0.5 text-[11px] tracking-wider uppercase opacity-60">
            {certification}
          </p>
        ) : null}
        <p className="mt-2 text-xs leading-relaxed opacity-80">{claim}</p>
        <ul className="mt-3 space-y-1 text-xs opacity-80">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-current opacity-50" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        {!material.freshPiercingSafe ? (
          <p
            className="mt-3 text-[11px] leading-relaxed"
            style={{ color: "var(--color-brand-maroon)" }}
          >
            {t("healedOnly")}
          </p>
        ) : null}
      </div>
    </section>
  );
}
