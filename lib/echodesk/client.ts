import type {
  EchoDeskProduct,
  EchoDeskShippingMethod,
  EchoDeskStoreConfig,
  Paginated,
} from "./types";

/**
 * EchoDesk storefront API client.
 *
 * The tenant base URL is the single switch: unset, every getter returns `null` and the
 * catalog layer keeps serving the bundled sample data. That keeps the storefront working
 * while the tenant is still being populated, and makes the cutover one env var rather than
 * a deploy.
 *
 *   NEXT_PUBLIC_ECHODESK_API_URL="https://nitchiani.api.echodesk.ge"
 *
 * Public storefront reads need no auth — the tenant is identified by the subdomain. Cart,
 * checkout and account calls do, and are not implemented here yet.
 */
const API_URL = process.env.NEXT_PUBLIC_ECHODESK_API_URL?.replace(/\/+$/, "");

export const isEchoDeskConfigured = Boolean(API_URL);

/** Storefront reads are cached; the catalog changes far less often than it's requested. */
const DEFAULT_REVALIDATE = 300;

async function get<T>(path: string, revalidate = DEFAULT_REVALIDATE): Promise<T | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/api/ecommerce/client${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate },
    });
    if (!res.ok) {
      console.error("[echodesk] GET", path, "->", res.status);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    // Never let a backend blip take the storefront down — the caller falls back to samples.
    console.error("[echodesk] GET", path, "threw:", err);
    return null;
  }
}

export function listProducts(limit = 100): Promise<Paginated<EchoDeskProduct> | null> {
  return get<Paginated<EchoDeskProduct>>(`/products/?page_size=${limit}`);
}

/** Products are addressed by slug in our URLs; the API filters on it. */
export async function getProductBySlug(slug: string): Promise<EchoDeskProduct | null> {
  const page = await get<Paginated<EchoDeskProduct>>(
    `/products/?slug=${encodeURIComponent(slug)}`,
  );
  const match = page?.results?.find((p) => p.slug === slug);
  if (!match) return null;
  // The list serialiser omits images/variants, so re-read the detail record for the PDP.
  return (await get<EchoDeskProduct>(`/products/${match.id}/`)) ?? match;
}

export function listShippingMethods(): Promise<Paginated<EchoDeskShippingMethod> | null> {
  return get<Paginated<EchoDeskShippingMethod>>("/shipping-methods/");
}

/**
 * Tenant configuration. Worth reading before offering a payment method: `enable_card_payment`
 * can be true while `active_providers` is empty, which means card is switched on in principle
 * and unusable in practice.
 */
export function getStoreConfig(): Promise<EchoDeskStoreConfig | null> {
  return get<EchoDeskStoreConfig>("/theme/", 60);
}
