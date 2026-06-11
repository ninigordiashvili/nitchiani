"use client";

import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { WhatsAppIcon, getWhatsAppNumber } from "@/components/brand/WhatsAppIcon";
import type { Service } from "@/lib/services";
import { cn } from "@/lib/utils";

/**
 * WhatsApp-first booking form. Replaces the previous Cal.com embed for now — Tbilisi
 * salons largely operate via WhatsApp already, and a structured pre-typed request
 * removes the back-and-forth without us needing a paid booking SaaS.
 *
 * Flow: customer picks date + time window + adds optional notes → we build a structured
 * WhatsApp message and open `wa.me/<number>?text=<message>`. The studio confirms by hand
 * within the hour and (optionally) sends a deposit link.
 *
 * When booking volume grows past what manual confirms can handle, swap this for Cal Pro /
 * Setmore / Square Appointments — the surrounding page layout stays.
 */

const TIME_WINDOWS = ["morning", "afternoon", "evening"] as const;
type TimeWindow = (typeof TIME_WINDOWS)[number];

export function WhatsAppBookingForm({ service }: { service: Service }) {
  const t = useTranslations("booking");
  const locale = useLocale();
  const ka = locale === "ka";

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("afternoon");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Min selectable date = tomorrow. No-shows happen with same-day bookings, and the studio
  // needs at least a day to confirm and prep.
  const minDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date) {
      setError(t("requiredError"));
      return;
    }
    if (date < minDate) {
      setError(t("pastDateError"));
      return;
    }
    setError(null);

    const serviceTitle = ka ? service.titleKa : service.titleEn;
    const dateFormatted = new Intl.DateTimeFormat(ka ? "ka-GE" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));

    const lines = [
      ka
        ? `გამარჯობა — მსურს დავჯავშნო ${serviceTitle}.`
        : `Hi — I'd like to book ${serviceTitle}.`,
      "",
      `${ka ? "თარიღი" : "Date"}: ${dateFormatted}`,
      `${ka ? "დრო" : "Time"}: ${t(`time_${timeWindow}`)}`,
      `${ka ? "სახელი" : "Name"}: ${name.trim()}`,
    ];
    if (notes.trim()) {
      lines.push(`${ka ? "შენიშვნა" : "Notes"}: ${notes.trim()}`);
    }
    const message = lines.join("\n");

    const number = getWhatsAppNumber();
    window.open(
      `https://wa.me/${number}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed opacity-80">{t("intro")}</p>

      <form onSubmit={onSubmit} className="space-y-5">
        <Field label={t("nameLabel")}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            autoComplete="name"
            className={inputCls}
          />
        </Field>

        <Field label={t("dateLabel")}>
          <div className="relative">
            <CalendarDays
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 opacity-50"
            />
            <input
              type="date"
              value={date}
              min={minDate}
              onChange={(e) => setDate(e.target.value)}
              className={cn(inputCls, "pl-10")}
            />
          </div>
        </Field>

        <fieldset>
          <legend className="label-eyebrow mb-2 inline-flex items-center gap-1.5">
            <Clock size={12} />
            {t("timeLabel")}
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {TIME_WINDOWS.map((w) => {
              const selected = w === timeWindow;
              return (
                <label
                  key={w}
                  className={cn(
                    "flex cursor-pointer items-center justify-center rounded-md border px-2 py-2 text-xs transition-colors",
                    selected
                      ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--surface)]"
                      : "border-black/15 hover:border-black/40",
                  )}
                >
                  <input
                    type="radio"
                    name="time-window"
                    value={w}
                    checked={selected}
                    onChange={() => setTimeWindow(w)}
                    className="sr-only"
                  />
                  {t(`time_${w}`)}
                </label>
              );
            })}
          </div>
        </fieldset>

        <Field label={t("notesLabel")}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("notesPlaceholder")}
            rows={3}
            className={cn(inputCls, "min-h-24 resize-y")}
          />
        </Field>

        {error ? (
          <p
            role="alert"
            className="text-xs"
            style={{ color: "var(--color-brand-maroon)" }}
          >
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn-primary w-full">
          <WhatsAppIcon size={16} />
          {t("submit")}
          <ArrowRight size={14} />
        </button>
      </form>

      {/* "What happens next" — sets expectations so the customer isn't waiting in silence. */}
      <div className="rounded-md border border-black/10 p-4 text-xs">
        <p className="label-eyebrow mb-3">{t("afterTitle")}</p>
        <ol className="space-y-2">
          {(["afterStep1", "afterStep2", "afterStep3"] as const).map((key, i) => (
            <li key={key} className="flex items-start gap-2.5">
              <span
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-medium tabular-nums"
                style={{
                  background:
                    "color-mix(in oklab, var(--color-brand-maroon) 12%, transparent)",
                  color: "var(--color-brand-maroon)",
                }}
              >
                {i + 1}
              </span>
              <span className="leading-relaxed opacity-85">{t(key)}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-eyebrow mb-2 block">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-black/15 bg-white/60 px-3 py-2.5 text-sm focus:border-[var(--color-brand-ink)] focus:outline-none";
