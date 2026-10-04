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
    // Stacked and centred on a phone, where the title and the link side by side left the
    // title cramped against a long label; side by side from sm up, where there is room.
    <div className="mb-5 flex flex-col items-center gap-2 text-center sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:text-left">
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
