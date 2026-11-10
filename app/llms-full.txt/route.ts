import { CATEGORY_HANDLES } from "@/lib/categories";
import { SITE_URL } from "@/lib/seo";
import { getCollectionByHandle } from "@/lib/shopify/client";

/**
 * `/llms-full.txt` — the catalogue as plain text for AI assistants: every product name and
 * its page, grouped by category. No prices or stock, which change daily and are published
 * (kept current) in each product page's structured data. See `/llms.txt` for the summary.
 */
export const revalidate = 3600;

export async function GET() {
  const sections: string[] = [];
  for (const handle of CATEGORY_HANDLES) {
    const c = await getCollectionByHandle(handle, "en").catch(() => null);
    if (!c || c.products.length === 0) continue;
    const lines = c.products.map((p) => `- [${p.title}](${SITE_URL}/en/products/${p.handle})`);
    sections.push(`## ${c.title}\n${SITE_URL}/en/shop/${handle}\n\n${lines.join("\n")}`);
  }
  const body = `# Nitchiani — product index\n\n> Every product by category. Georgian pages: replace /en/ with /ka/. Price and availability are on each product page.\n\n${sections.join("\n\n")}\n`;
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
