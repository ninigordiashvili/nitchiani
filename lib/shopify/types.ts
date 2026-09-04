import type { Money } from "../money";

export type { Money };

export type ImageRef = {
  url: string;
  altText: string;
  width?: number;
  height?: number;
};

export type ProductOption = {
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  /**
   * Units the shop can actually ship, when the backend tracks them. `undefined` means
   * untracked — treat it as no ceiling rather than as zero, or an untracked product becomes
   * unbuyable.
   */
  quantityAvailable?: number;
  selectedOptions: { name: string; value: string }[];
  price: Money;
  compareAtPrice?: Money;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  /** Optional usage guidance — rendered as the "How to use" PDP section when present. */
  howToUse?: string;
  /** Optional ingredient/material copy — rendered as the "What's inside" PDP section. */
  whatsInside?: string;
  /** Optional aftercare instructions — rendered as the "Aftercare" PDP section. Primarily
   *  used for piercings, but the field is generic so any product type can populate it. */
  aftercare?: string;
  tags: string[];
  vendor: string;
  productType: string;
  featuredImage: ImageRef;
  images: ImageRef[];
  options: ProductOption[];
  variants: ProductVariant[];
  priceRange: { min: Money; max: Money };
  isBestSeller?: boolean;
  /**
   * Locale-stable slug derived from the English product type. Used for breadcrumb links
   * and category navigation — `productType` itself is localized (e.g. `ბონნეტები`) and
   * can't be used as a URL fragment.
   */
  productTypeHandle: string;
  /**
   * Optional handle into the piercing-material registry (`lib/piercings.ts`). Only set
   * for products in the Piercings category — drives the `MaterialTrust` panel on the PDP.
   */
  material?: string;
  /**
   * Rating summary as reported by the backend. Present only when the catalog is live —
   * the sample catalog's ratings are derived from `lib/reviews.ts` instead.
   */
  reviewSummary?: { count: number; average: number };
  /**
   * Filterable attributes as declared by the backend — hair type, length, and whatever else
   * the catalog defines later. Generic on purpose: the toolbar builds a chip row per
   * attribute it finds, so a new one needs no code here.
   */
  attributes?: ProductAttribute[];
};

export type ProductAttribute = {
  /** Stable key from the backend, used in the URL. */
  key: string;
  /** Localized label for the chip group heading. */
  name: string;
  /** Localized values this product carries for the attribute. */
  values: string[];
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image?: ImageRef;
  products: Product[];
};

export type CartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    selectedOptions: { name: string; value: string }[];
    product: { handle: string; title: string; featuredImage: ImageRef };
    price: Money;
  };
  totalAmount: Money;
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: CartLine[];
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
};
