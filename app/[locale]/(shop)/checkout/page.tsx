"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loadSavedContact, saveContact } from "@/lib/checkout/saved-contact";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  CreditCard,
  Loader2,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "@/lib/i18n/routing";
import { useCart } from "@/lib/cart/store";
import { formatPrice } from "@/lib/money";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { BLUR_DATA_URL, safeImageSrc } from "@/lib/images";
import { CouponField } from "@/components/cart/CouponField";
import { HowItWorksButton } from "@/components/cart/HowItWorksButton";
import { PhoneInput } from "@/components/commerce/PhoneInput";

const checkoutSchema = z.object({
  firstName: z.string().min(1),
  // Surname and email are optional — plenty of Georgian customers order with a first
  // name and a phone number alone. Email still has to be well-formed if given, so a
  // typo can't silently swallow the order confirmation.
  // Required: EchoDesk rejects an order without it ("Missing required fields: last_name"),
  // so leaving it optional here only moves the failure to the last step of checkout.
  lastName: z.string().min(1),
  // Canonical E.164 phone. `+` followed by 7–15 digits, leading digit 1–9. The PhoneInput
  // component now accepts diaspora numbers (US/UK/DE/IL/TR/FR/IT/ES/RU) in addition to
  // Georgia (+995), so the schema is loosened to the generic E.164 shape. The PhoneInput
  // itself clamps each country's local digits length, so an obviously-broken value can't
  // get this far.
  phone: z.string().regex(/^\+[1-9]\d{6,14}$/, "Enter a valid phone number"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(3),
  city: z.string().min(1),
  // Georgian post codes are 4 digits; the input strips non-digits so we only need to allow
  // an empty string (optional) or the 4-digit canonical form.
  postalCode: z
    .string()
    .regex(/^\d{4}$/, "Enter a 4-digit postal code")
    .optional()
    .or(z.literal("")),
  notes: z.string().optional(),
  paymentMethod: z.enum(["bank_transfer", "cod", "bog_card", "tbc_card"]),
});
type CheckoutInput = z.infer<typeof checkoutSchema>;

const BOG_ENABLED = process.env.NEXT_PUBLIC_BOG_ENABLED === "true";
const TBC_ENABLED = process.env.NEXT_PUBLIC_TBC_ENABLED === "true";
// Cash on delivery is temporarily withdrawn. Unlike the card flags above — which gate on
// merchant credentials existing — this one is a business decision, so it defaults OFF and
// comes back by setting NEXT_PUBLIC_COD_ENABLED=true. No code change, no redeploy of the
// bundle logic. The enum, the labels, the Shopify tag and the email copy all stay in place.
const COD_ENABLED = process.env.NEXT_PUBLIC_COD_ENABLED === "true";

export default function CheckoutPage() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const cart = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /** Maps an API error key to localised copy, falling back to the generic failure line. */
  const translateCheckoutError = (key: unknown): string => {
    if (typeof key !== "string" || !key) return t("checkout.errors.orderFailed");
    // `t.has` guards keys added server-side that this bundle doesn't know yet.
    const path = `checkout.errors.${key}`;
    return t.has(path as never) ? t(path as never) : t("checkout.errors.orderFailed");
  };
  // Mobile-only two-step flow: 1 = contact/shipping, 2 = payment + place order.
  // Desktop ignores `step` entirely because both fieldsets are rendered side-by-side via
  // the existing `lg:grid-cols-[1fr_360px]` layout.
  const [step, setStep] = useState<1 | 2>(1);

  const {
    control,
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      city: "Tbilisi",
      paymentMethod: BOG_ENABLED ? "bog_card" : TBC_ENABLED ? "tbc_card" : "bank_transfer",
    },
  });

  // Pre-fill the form from saved contact (set by a previous successful checkout). Runs on
  // mount so we don't mismatch SSR; `reset` is RHF's way to swap defaults without losing
  // the form's other state (errors, dirty flags reset cleanly).
  useEffect(() => {
    const saved = loadSavedContact();
    if (!saved) return;
    reset({
      ...saved,
      paymentMethod: BOG_ENABLED ? "bog_card" : TBC_ENABLED ? "tbc_card" : "bank_transfer",
    });
  }, [reset]);

  const paymentMethod = watch("paymentMethod");

  if (cart.lines.length === 0) {
    return (
      <div className="container-shop flex min-h-[60vh] flex-col items-center justify-center gap-3 py-12 text-center">
        <h1 className="font-display text-3xl">{t("cart.empty")}</h1>
        <p className="text-sm opacity-70">{t("cart.emptyDesc")}</p>
      </div>
    );
  }

  const advanceToPayment = async () => {
    const ok = await trigger([
      "firstName",
      "lastName",
      "phone",
      "email",
      "address",
      "city",
    ]);
    if (ok) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const backToShipping = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (values: CheckoutInput) => {
    setSubmitting(true);
    setSubmitError(null);
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
          couponCode: cart.coupon?.code ?? null,
          discount: cart.discount,
          total: cart.total,
        }),
      });
      const data = (await res.json()) as {
        orderId?: string;
        /** Public order token, when the backend issues one — used to build the tracking link. */
        trackingToken?: string;
        redirectUrl?: string;
        error?: string;
      };
      // The API answers with a stable key, never a sentence, so the message the shopper reads
      // is rendered in their own language here rather than echoed from the server in English.
      if (!res.ok) throw new Error(translateCheckoutError(data.error));

      // Persist the contact + shipping fields for the next checkout. We save BEFORE the
      // redirect so card-payment users (who leave the site to BOG/TBC) still benefit on
      // their next visit even though we never reach the success page handler here.
      saveContact({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email ?? "",
        phone: values.phone,
        address: values.address,
        city: values.city,
        postalCode: values.postalCode,
      });

      if (data.redirectUrl) {
        // BOG hosted payment page — clear cart only after payment confirms via webhook,
        // but redirect now so the customer can complete payment.
        window.location.href = data.redirectUrl;
        return;
      }

      if (!data.orderId) throw new Error(t("checkout.errors.orderFailed"));
      cart.clear();
      // `trackingToken` is the order's public token when the backend issues one. Carrying it
      // through is what lets the success page hand the customer a working tracking link —
      // without it they'd have nothing to look the order up with.
      const trackingQs = data.trackingToken
        ? `&token=${encodeURIComponent(data.trackingToken)}`
        : "";
      router.push(`/checkout/success?order=${encodeURIComponent(data.orderId)}${trackingQs}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t("checkout.errors.orderFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-shop pb-8 sm:pb-12">
      <h1 className="font-display mb-6 text-3xl tracking-tight sm:mb-8 sm:text-4xl">
        {t("checkout.title")}
      </h1>

      {/* Express checkout row — quick payment-method picker at the top of the page. Decoratively
          doubles as a "we accept these" trust strip; functionally pre-selects in the radio
          group below so the user doesn't have to scroll to choose. */}
      <div className="mb-8 border-b border-black/10 pb-6">
        <p className="label-eyebrow mb-3">{t("checkout.expressCheckout")}</p>
        <div className="flex flex-wrap gap-2">
          {BOG_ENABLED ? (
            <ExpressPill
              active={paymentMethod === "bog_card"}
              onClick={() => setValue("paymentMethod", "bog_card")}
              icon={<CreditCard size={14} />}
              label={t("checkout.bogCard")}
            />
          ) : null}
          {TBC_ENABLED ? (
            <ExpressPill
              active={paymentMethod === "tbc_card"}
              onClick={() => setValue("paymentMethod", "tbc_card")}
              icon={<CreditCard size={14} />}
              label={t("checkout.tbcCard")}
            />
          ) : null}
          <ExpressPill
            active={paymentMethod === "bank_transfer"}
            onClick={() => setValue("paymentMethod", "bank_transfer")}
            icon={<Banknote size={14} />}
            label={t("checkout.bankTransfer")}
          />
          {COD_ENABLED ? (
            <ExpressPill
              active={paymentMethod === "cod"}
              onClick={() => setValue("paymentMethod", "cod")}
              icon={<Wallet size={14} />}
              label={t("checkout.cod")}
            />
          ) : null}
        </div>
      </div>

      {/* Mobile step indicator. Desktop has both fieldsets visible at once so the indicator
          is irrelevant there — `sm:hidden` removes it from the wider layout entirely. */}
      <div className="mb-6 flex items-center gap-2 sm:hidden">
        <StepBadge num={1} state={step === 1 ? "active" : "done"} />
        <span
          className={cn(
            "text-xs",
            step === 1 ? "font-medium" : "opacity-70",
          )}
        >
          {t("checkout.stepContact")}
        </span>
        <span className="mx-1 h-px flex-1 bg-black/10" />
        <StepBadge num={2} state={step === 2 ? "active" : "future"} />
        <span
          className={cn(
            "text-xs",
            step === 2 ? "font-medium" : "opacity-70",
          )}
        >
          {t("checkout.stepPayment")}
        </span>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-10 lg:grid-cols-[1fr_360px]"
      >
        <div>
          {/* "Back to shipping" link — visible only on mobile step 2. */}
          {step === 2 ? (
            <button
              type="button"
              onClick={backToShipping}
              className="-ml-1 mb-4 inline-flex cursor-pointer items-center gap-1.5 text-xs underline-offset-2 opacity-80 hover:underline hover:opacity-100 sm:hidden"
            >
              <ArrowLeft size={14} />
              {t("checkout.backToShipping")}
            </button>
          ) : null}

          {/* Shipping fieldset — hidden on mobile step 2; always visible on sm+. */}
          <fieldset className={cn("mb-8", step === 2 && "hidden sm:block")}>
            <legend className="font-display mb-4 text-xl">{t("checkout.shipping")}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t("checkout.firstName")} error={errors.firstName?.message} required>
                <input className={inputCls} aria-required {...register("firstName")} />
              </Field>
              <Field label={t("checkout.lastName")} required error={errors.lastName?.message}>
                <input className={inputCls} {...register("lastName")} />
              </Field>
              <Field label={t("checkout.phone")} error={errors.phone?.message} required>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field }) => (
                    <PhoneInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      aria-invalid={errors.phone ? true : undefined}
                      aria-required
                    />
                  )}
                />
              </Field>
              <Field label={t("checkout.email")} error={errors.email?.message}>
                <input className={inputCls} type="email" {...register("email")} />
              </Field>
              <Field label={t("checkout.address")} error={errors.address?.message} className="sm:col-span-2" required>
                <input className={inputCls} aria-required {...register("address")} />
              </Field>
              <Field label={t("checkout.city")} error={errors.city?.message} required>
                <input className={inputCls} aria-required {...register("city")} />
              </Field>
              <Field label={t("checkout.postalCode")} error={errors.postalCode?.message}>
                {(() => {
                  const field = register("postalCode");
                  return (
                    <input
                      className={inputCls}
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={4}
                      autoComplete="postal-code"
                      {...field}
                      onChange={(e) => {
                        e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
                        field.onChange(e);
                      }}
                    />
                  );
                })()}
              </Field>
              <Field label={t("checkout.notes")} error={errors.notes?.message} className="sm:col-span-2">
                <textarea className={cn(inputCls, "min-h-20 resize-y")} {...register("notes")} />
              </Field>
            </div>
          </fieldset>

          {/* Inline "Continue to payment" on mobile step 1. The aside (which holds the
              other copy of this CTA) stacks below the form on mobile — surfacing a
              button right under the shipping fields saves the user a long scroll. */}
          {step === 1 ? (
            <button
              type="button"
              onClick={advanceToPayment}
              className="btn-primary mb-8 w-full sm:hidden"
            >
              {t("checkout.continueToPayment")}
              <ArrowRight size={16} />
            </button>
          ) : null}

          <fieldset className={cn(step === 1 && "hidden sm:block")}>
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
              {COD_ENABLED ? (
                <PaymentOption
                  active={paymentMethod === "cod"}
                  onSelect={() => setValue("paymentMethod", "cod")}
                  icon={<Wallet size={20} />}
                  title={t("checkout.cod")}
                  desc={t("checkout.codDesc")}
                />
              ) : null}
            </div>
          </fieldset>
        </div>

        <aside className="h-fit border border-black/10 p-5 lg:sticky lg:top-20">
          <h2 className="font-display mb-4 text-lg">{t("nav.cart")}</h2>
          <ul className="space-y-3 border-b border-black/10 pb-4">
            {cart.lines.map((l) => (
              <li key={l.variantId} className="flex gap-3">
                <div className="relative aspect-[4/5] w-12 flex-shrink-0 overflow-hidden bg-white">
                  <Image
                    src={safeImageSrc(l.image.url)}
                    alt={l.image.altText}
                    fill
                    sizes="48px"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className="object-contain"
                  />
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
          <div className="mt-4">
            <CouponField />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-70">{t("cart.subtotal")}</span>
            <span className="tabular-nums">{formatPrice(cart.subtotal, locale)}</span>
          </div>
          {cart.coupon && Number.parseFloat(cart.discount.amount) > 0 ? (
            <div
              className="mt-1 flex items-center justify-between text-sm"
              style={{ color: "var(--color-brand-maroon)" }}
            >
              <span className="opacity-80">
                {t("cart.discount")} · {cart.coupon.code}
              </span>
              <span className="tabular-nums">−{formatPrice(cart.discount, locale)}</span>
            </div>
          ) : null}
          <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3">
            <span className="font-medium">{t("cart.total")}</span>
            <span className="font-display text-xl tabular-nums">
              {formatPrice(cart.total, locale)}
            </span>
          </div>
          {submitError ? (
            <div
              role="alert"
              aria-live="polite"
              className="mt-4 flex items-start gap-2 rounded-md px-3 py-2.5 text-xs"
              style={{
                background: "color-mix(in oklab, var(--color-brand-maroon) 10%, transparent)",
                color: "var(--color-brand-maroon-3)",
                border: "1px solid color-mix(in oklab, var(--color-brand-maroon) 30%, transparent)",
              }}
            >
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          ) : null}
          {/* Mobile step 1: "Continue to payment" advances to step 2 (no submission). */}
          <button
            type="button"
            onClick={advanceToPayment}
            className={cn(
              "btn-primary mt-5 w-full",
              step === 1 ? "sm:hidden" : "hidden",
            )}
          >
            {t("checkout.continueToPayment")}
            <ArrowRight size={16} />
          </button>

          {/* Mobile step 2 + desktop: real submit. */}
          <button
            type="submit"
            disabled={submitting}
            className={cn(
              "btn-primary mt-5 w-full",
              submitting && "opacity-60",
              step === 1 && "hidden sm:inline-flex",
            )}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t("common.loading")}
              </>
            ) : (
              t("checkout.placeOrder")
            )}
          </button>

          <PaymentTrust />

          <div className="mt-4 flex justify-center">
            <HowItWorksButton />
          </div>
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
  required = false,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  /** Draws the maroon asterisk. Pair it with `aria-required` on the control itself —
      the asterisk is `aria-hidden`, so on its own it tells assistive tech nothing. */
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      {/* Sentence-case 13px form label — the editorial `label-eyebrow` (11px tracked uppercase)
          looks great as a section eyebrow but is hard to scan on a mobile form. Keep the
          eyebrow style for section headings; forms get this calmer treatment. */}
      <span className="mb-1.5 block text-[13px] font-medium text-[var(--color-brand-ink)]">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-[var(--color-brand-maroon)]">
            *
          </span>
        ) : null}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs text-[var(--color-brand-maroon)]">{error}</span> : null}
    </label>
  );
}

/**
 * Trust strip under the Place Order button. Card-brand pills only render when at least one
 * card processor is enabled — otherwise BOG/TBC/Visa/Mastercard would be misleading next to a
 * bank-transfer-only flow. The shield + "Secure checkout" line always renders.
 */
function PaymentTrust() {
  const t = useTranslations("product");
  const cardMethods: string[] = [];
  if (BOG_ENABLED) cardMethods.push("BOG");
  if (TBC_ENABLED) cardMethods.push("TBC");
  if (cardMethods.length > 0) cardMethods.push("VISA", "MASTERCARD");

  return (
    <div className="mt-3 space-y-1.5">
      {cardMethods.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {cardMethods.map((label) => (
            <span
              key={label}
              className="rounded border border-black/15 px-2 py-0.5 text-[10px] font-medium tracking-[0.14em]"
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}
      <div className="flex items-center justify-center gap-1.5 text-[11px] opacity-60">
        <ShieldCheck size={12} />
        <span>{t("secureCheckout")}</span>
      </div>
    </div>
  );
}

function ExpressPill({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
        active
          ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--surface)]"
          : "border-black/15 hover:border-black/40",
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StepBadge({
  num,
  state,
}: {
  num: number;
  state: "active" | "done" | "future";
}) {
  return (
    <span
      className={cn(
        "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-medium tabular-nums",
        state === "active" &&
          "bg-[var(--color-brand-maroon)] text-[var(--color-brand-cream)]",
        state === "done" &&
          "border border-[var(--color-brand-maroon)] text-[var(--color-brand-maroon)]",
        state === "future" &&
          "border border-black/20 text-[var(--color-brand-ink)] opacity-60",
      )}
      aria-hidden="true"
    >
      {state === "done" ? <Check size={12} strokeWidth={2.5} /> : num}
    </span>
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
