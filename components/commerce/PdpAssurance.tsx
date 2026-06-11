import { ArrowRight, CreditCard, RotateCcw, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { getWhatsAppNumber, WhatsAppIcon } from "@/components/brand/WhatsAppIcon";

/**
 * Combined "we got you" block for the PDP right column. Replaces the older pair of
 * `<TrustStrip layout="column">` + `<ProductHelpCard>` that sat next to each other doing
 * adjacent jobs — three passive trust pillars on top, the active WhatsApp help affordance
 * at the bottom, all inside a single bordered card.
 *
 * Reuses the existing translations from `home.trust.*` and `product.askQuestion*` so the
 * merge is a layout consolidation, not a content rewrite.
 *
 * Server component — pure presentation, no state.
 */
export function PdpAssurance({ productTitle }: { productTitle: string }) {
  const tTrust = useTranslations("home.trust");
  const tProduct = useTranslations("product");
  const tWa = useTranslations("whatsapp");
  const number = getWhatsAppNumber();
  // Locale-aware prefilled message — Georgian customers shouldn't open a chat with a
  // pre-typed English greeting.
  const message = encodeURIComponent(tWa("productMessage", { title: productTitle }));
  const whatsappHref = `https://wa.me/${number}?text=${message}`;

  const items = [
    {
      icon: <Truck size={18} />,
      title: tTrust("shipping"),
      desc: tTrust("shippingDesc"),
    },
    {
      icon: <RotateCcw size={18} />,
      title: tTrust("returns"),
      desc: tTrust("returnsDesc"),
    },
    {
      icon: <CreditCard size={18} />,
      title: tTrust("payment"),
      desc: tTrust("paymentDesc"),
    },
  ];

  return (
    <div className="mt-6 overflow-hidden rounded-md border border-black/10">
      <ul className="divide-y divide-black/5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-3 p-4">
            <span
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
              style={{ background: "var(--surface-elevated)" }}
            >
              {item.icon}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight">{item.title}</p>
              <p className="text-xs opacity-60">{item.desc}</p>
            </div>
          </li>
        ))}
      </ul>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer noopener"
        className="flex items-center gap-3 border-t border-black/10 p-4 transition-colors hover:bg-black/[0.02]"
        style={{
          background: "color-mix(in oklab, #25D366 6%, transparent)",
        }}
      >
        <span
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
          style={{ background: "#25D366", color: "white" }}
        >
          <WhatsAppIcon size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-tight">
            {tProduct("askQuestion")}
          </p>
          <p className="mt-0.5 text-xs opacity-70">
            {tProduct("askQuestionDesc")}
          </p>
        </div>
        <ArrowRight size={16} className="flex-shrink-0 opacity-50" />
      </a>
    </div>
  );
}
