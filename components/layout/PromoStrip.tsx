"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function PromoStrip() {
  const t = useTranslations("promo");
  const messages = [t("shipping"), t("newDrop")];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % messages.length), 4500);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div
      className="w-full text-center text-[11px] tracking-[0.18em] uppercase"
      style={{
        background: "var(--color-brand-bg)",
        color: "var(--color-brand-cream)",
      }}
    >
      <div className="container-shop relative h-7 overflow-hidden">
        {messages.map((m, i) => (
          <span
            key={m}
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
            style={{ opacity: i === idx ? 1 : 0 }}
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
