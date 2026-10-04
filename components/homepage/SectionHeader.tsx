import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/i18n/routing";
import { useTranslations } from "next-intl";

export function SectionHeader({
  title,
  href,
  eyebrow,
}: {
  title: string;
  href?: string;
  eyebrow?: string;
}) {
  const t = useTranslations("home");
  return (
    // One row at every width, pushed apart, with the link sitting on the title's centre line
    // rather than its baseline.
    <div className="mb-5 flex items-center justify-between gap-3 sm:gap-4">
      <div>
        {eyebrow ? <p className="label-eyebrow mb-1.5">{eyebrow}</p> : null}
        <h2 className="font-display text-2xl tracking-tight sm:text-3xl">{title}</h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="group inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.16em] whitespace-nowrap"
        >
          {t("viewAll")}
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      ) : null}
    </div>
  );
}
