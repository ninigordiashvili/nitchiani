"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Banknote, CreditCard, Wallet } from "lucide-react";
import Image from "next/image";
import { useRouter } from "@/lib/i18n/routing";
import { useCart } from "@/lib/cart/store";
import { formatPrice } from "@/lib/money";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { safeImageSrc } from "@/lib/images";

const checkoutSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email(),
  address: z.string().min(3),
  city: z.string().min(1),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["bank_transfer", "cod", "bog_card", "tbc_card"]),
});
type CheckoutInput = z.infer<typeof checkoutSchema>;

const BOG_ENABLED = process.env.NEXT_PUBLIC_BOG_ENABLED === "true";
const TBC_ENABLED = process.env.NEXT_PUBLIC_TBC_ENABLED === "true";

export default function CheckoutPage() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const cart = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: BOG_ENABLED ? "bog_card" : TBC_ENABLED ? "tbc_card" : "bank_transfer",
    },
  });

  const paymentMethod = watch("paymentMethod");

  if (cart.lines.length === 0) {
    return (
      <div className="container-shop flex min-h-[60vh] flex-col items-center justify-center gap-3 py-12 text-center">
        <h1 className="font-display text-3xl">{t("cart.empty")}</h1>
        <p className="text-sm opacity-70">{t("cart.emptyDesc")}</p>
      </div>
    );
  }

  const onSubmit = async (values: CheckoutInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          locale,
          lines: cart.lines.map((l) => ({
            variantId: l.variantId,
            productHandle: l.productHandle,
            productTitle: l.productTitle,
            variantTitle: l.variantTitle,
            unitPrice: l.unitPrice,
            quantity: l.quantity,
          })),
          subtotal: cart.subtotal,
        }),
      });
      const data = (await res.json()) as {
        orderId?: string;
        redirectUrl?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Order failed");

      if (data.redirectUrl) {
        // BOG hosted payment page — clear cart only after payment confirms via webhook,
        // but redirect now so the customer can complete payment.
        window.location.href = data.redirectUrl;
        return;
      }

      if (!data.orderId) throw new Error("Order failed");
      cart.clear();
      router.push(`/checkout/success?order=${data.orderId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Order failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-shop py-8 sm:py-12">
      <h1 className="font-display mb-8 text-3xl tracking-tight sm:text-4xl">
        {t("checkout.title")}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-10 lg:grid-cols-[1fr_360px]"
      >
        <div>
          <fieldset className="mb-8">
            <legend className="font-display mb-4 text-xl">{t("checkout.shipping")}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t("checkout.firstName")} error={errors.firstName?.message}>
                <input className={inputCls} {...register("firstName")} />
              </Field>
              <Field label={t("checkout.lastName")} error={errors.lastName?.message}>
                <input className={inputCls} {...register("lastName")} />
              </Field>
              <Field label={t("checkout.phone")} error={errors.phone?.message}>
                <input className={inputCls} type="tel" {...register("phone")} />
              </Field>
              <Field label={t("checkout.email")} error={errors.email?.message}>
                <input className={inputCls} type="email" {...register("email")} />
              </Field>
              <Field label={t("checkout.address")} error={errors.address?.message} className="sm:col-span-2">
                <input className={inputCls} {...register("address")} />
              </Field>
              <Field label={t("checkout.city")} error={errors.city?.message}>
                <input className={inputCls} {...register("city")} defaultValue="Tbilisi" />
              </Field>
              <Field label={t("checkout.postalCode")} error={errors.postalCode?.message}>
                <input className={inputCls} {...register("postalCode")} />
              </Field>
              <Field label={t("checkout.notes")} error={errors.notes?.message} className="sm:col-span-2">
                <textarea className={cn(inputCls, "min-h-20 resize-y")} {...register("notes")} />
              </Field>
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-display mb-4 text-xl">{t("checkout.paymentMethod")}</legend>
            <div className="space-y-3">
              {BOG_ENABLED ? (
                <PaymentOption
                  active={paymentMethod === "bog_card"}
                  onSelect={() => setValue("paymentMethod", "bog_card")}
                  icon={<CreditCard size={20} />}
                  title={t("checkout.bogCard")}
                  desc={t("checkout.bogCardDesc")}
                />
              ) : null}
              {TBC_ENABLED ? (
                <PaymentOption
                  active={paymentMethod === "tbc_card"}
                  onSelect={() => setValue("paymentMethod", "tbc_card")}
                  icon={<CreditCard size={20} />}
                  title={t("checkout.tbcCard")}
                  desc={t("checkout.tbcCardDesc")}
                />
              ) : null}
              <PaymentOption
                active={paymentMethod === "bank_transfer"}
                onSelect={() => setValue("paymentMethod", "bank_transfer")}
                icon={<Banknote size={20} />}
                title={t("checkout.bankTransfer")}
                desc={t("checkout.bankTransferDesc")}
              />
              <PaymentOption
                active={paymentMethod === "cod"}
                onSelect={() => setValue("paymentMethod", "cod")}
                icon={<Wallet size={20} />}
                title={t("checkout.cod")}
                desc={t("checkout.codDesc")}
              />
            </div>
          </fieldset>
        </div>

        <aside className="h-fit border border-black/10 p-5 lg:sticky lg:top-20">
          <h2 className="font-display mb-4 text-lg">{t("nav.cart")}</h2>
          <ul className="space-y-3 border-b border-black/10 pb-4">
            {cart.lines.map((l) => (
              <li key={l.variantId} className="flex gap-3">
                <div className="relative h-14 w-12 flex-shrink-0 overflow-hidden bg-black/5">
                  <Image src={safeImageSrc(l.image.url)} alt={l.image.altText} fill sizes="48px" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="line-clamp-1 text-sm">{l.productTitle}</span>
                  <span className="text-xs opacity-60">× {l.quantity}</span>
                </div>
                <span className="text-sm tabular-nums">
                  {formatPrice(
                    {
                      amount: (Number.parseFloat(l.unitPrice.amount) * l.quantity).toFixed(2),
                      currencyCode: l.unitPrice.currencyCode,
                    },
                    locale,
                  )}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-medium">{t("cart.total")}</span>
            <span className="font-display text-xl">{formatPrice(cart.subtotal, locale)}</span>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={cn("btn-primary mt-5 w-full", submitting && "opacity-60")}
          >
            {submitting ? t("common.loading") : t("checkout.placeOrder")}
          </button>
        </aside>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-black/15 bg-white/60 px-3 py-2.5 text-sm focus:border-[var(--color-brand-ink)] focus:outline-none";

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="label-eyebrow mb-1.5 block">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-[var(--color-brand-maroon)]">{error}</span> : null}
    </label>
  );
}

function PaymentOption({
  active,
  onSelect,
  icon,
  title,
  desc,
}: {
  active: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-md border p-4 text-left transition-colors",
        active
          ? "border-[var(--color-brand-ink)] bg-[var(--color-brand-cream-2)]"
          : "border-black/15 hover:border-black/40",
      )}
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full"
        style={{ background: "var(--color-brand-cream-2)" }}
      >
        {icon}
      </span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs opacity-70">{desc}</p>
      </div>
    </button>
  );
}
