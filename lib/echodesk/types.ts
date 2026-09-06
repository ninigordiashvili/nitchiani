/**
 * Response shapes for the EchoDesk storefront API (`/api/ecommerce/client/...`).
 *
 * Hand-written rather than generated: the template's generator emits the full CRM surface
 * (69 endpoints), and we only consume the storefront slice. Fields are typed as optional
 * wherever the list and detail serialisers disagree — the list endpoint omits `images`,
 * `variants` and `attribute_values`, so an adapter fed a list row must not assume them.
 */

/** EchoDesk returns user-facing strings per-locale, keyed by language code. */
export type LocalizedText = Partial<Record<string, string>>;

export type EchoDeskImage = {
  id: number;
  image: string;
  alt_text?: string | null;
  sort_order?: number;
};

export type EchoDeskVariant = {
  id: number;
  sku?: string;
  name?: LocalizedText;
  price?: string;
  compare_at_price?: string | null;
  quantity?: number;
  is_in_stock?: boolean;
  attribute_values?: EchoDeskAttributeValue[];
};

export type EchoDeskAttributeValue = {
  attribute?: {
    key?: string;
    name?: LocalizedText;
    attribute_type?: string;
    is_filterable?: boolean;
    /** Allowed values for select/multiselect, each carrying its own translations. */
    options?: Array<LocalizedText & { value?: string }>;
  };
  /** Shape depends on `attribute_type`: array for multiselect, scalar otherwise. */
  value?: unknown;
  value_text?: string;
};

export type EchoDeskProduct = {
  id: number;
  sku?: string;
  slug: string;
  name: LocalizedText;
  description?: LocalizedText;
  short_description?: LocalizedText;
  price: string;
  compare_at_price?: string | null;
  discount_percentage?: number;
  image?: string | null;
  /** Detail endpoint only. */
  images?: EchoDeskImage[];
  variants?: EchoDeskVariant[];
  attribute_values?: EchoDeskAttributeValue[];
  quantity?: number;
  is_in_stock?: boolean;
  is_featured?: boolean;
  status?: string;
  average_rating?: number | null;
  review_count?: number;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type EchoDeskShippingMethod = {
  id: number;
  name?: LocalizedText;
  description?: LocalizedText;
  price?: string;
  free_shipping_threshold?: string | null;
  is_active?: boolean;
  estimated_days?: number;
  position?: number;
};

/** `/theme/` — the tenant's own switches. Drives what checkout may offer. */
export type EchoDeskStoreConfig = {
  store_name?: string;
  payment?: {
    /** Card providers actually switched on for this tenant. Empty means card is unusable. */
    active_providers?: string[];
    enable_cash_on_delivery?: boolean;
    enable_card_payment?: boolean;
    currency?: string;
    tax_rate?: string;
    tax_inclusive?: boolean;
  };
  shipping?: { quickshipper_enabled?: boolean };
  pickup?: {
    enabled?: boolean;
    address?: string;
    city?: string;
    phone?: string;
    contact_name?: string;
    extra_instructions?: string;
  };
};
