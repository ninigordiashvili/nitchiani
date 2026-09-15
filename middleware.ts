import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // `opengraph-image` is excluded by name, not by the dot rule: it is a route, not a file, so
  // it carries no extension and the locale middleware happily rewrote /opengraph-image to
  // /ka/opengraph-image — a path that renders the HTML 404 page. Every share on Facebook,
  // WhatsApp or X fetched og:image, received HTML, and showed no preview at all.
  // `sitemap.xml` and `robots.txt` were never affected; they have extensions.
  matcher: ["/((?!api|_next|_vercel|auth|opengraph-image|twitter-image|.*\\..*).*)"],
};
