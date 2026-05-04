# Nitchiani

Mobile-first ecommerce storefront for **Nitchiani** — a premium braiding, dreadlock, locs, and haircare brand based in Tbilisi, Georgia.

Built with Next.js 15 (App Router) + Tailwind CSS v4 + Shopify Storefront API + Cal.com booking + KA/EN i18n.

## Quick start

```bash
cp .env.example .env.local   # fill in Shopify + WhatsApp + Cal.com values
npm install
npm run dev                  # http://localhost:3000
```

The site auto-redirects `/` to `/ka`. English lives at `/en`.

## Architecture

- **Storefront**: Next.js 15 App Router, server components by default
- **Commerce**: Shopify Storefront API for catalog/cart, Admin API for order writes
- **Checkout**: Custom Next.js checkout — Shopify's hosted checkout can't accept Georgian payment gateways. Phase 1 = bank transfer + cash-on-delivery; Phase 2 adds BOG e-Commerce / TBC Pay.
- **i18n**: `next-intl` with `ka` (default) + `en`
- **Booking**: Cal.com embed on service pages
- **Hosting**: Vercel

See `/Users/ninigordiashvili/.claude/plans/create-a-modern-mobile-first-tranquil-stonebraker.md` for the full plan.

## Brand

| Token | Hex |
|---|---|
| `--brand-bg` (teal-black) | `#0A1F1F` |
| `--brand-cream` | `#F5EFE6` |
| `--brand-maroon` (CTA, prices) | `#A14040` |
| `--brand-silver` | `#C8CCD0` |

Sampled from the logo. Never hardcode hex — always use the tokens.

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run typecheck` — strict TS check
- `npm run lint` — ESLint
- `npm run format` — Prettier
