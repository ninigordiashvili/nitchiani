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
  tags: string[];
  vendor: string;
  productType: string;
  featuredImage: ImageRef;
  images: ImageRef[];
  options: ProductOption[];
  variants: ProductVariant[];
  priceRange: { min: Money; max: Money };
  isNew?: boolean;
  isBestSeller?: boolean;
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
