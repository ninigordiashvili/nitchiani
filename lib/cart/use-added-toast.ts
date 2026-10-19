"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { useToast } from "@/lib/ui/toast";
import { useCart } from "./store";

/**
 * Confirms an add to the bag, and offers the bag.
 *
 * Four places add a line — the PDP button, the grid card's quick-add, frequently-bought and
 * the homepage bundle — and each used to raise a bare text toast. On mobile that was the
 * whole of the feedback: the drawer doesn't open, and the bag icon lives in a header that
 * has scrolled away by the time the shopper reaches an Add button. A customer told us they
 * had added a durag and couldn't find the cart.
 *
 * So the confirmation carries the way through, and it lives here rather than at each call
 * site, so a fifth place to add something can't quietly ship without it.
 */
export function useAddedToast() {
  const toast = useToast();
  const { setOpen } = useCart();
  const t = useTranslations("cart");

  return useCallback(
    (message: string) => {
      toast.show(message, "ink", { label: t("viewCart"), onClick: () => setOpen(true) });
    },
    [toast, setOpen, t],
  );
}
