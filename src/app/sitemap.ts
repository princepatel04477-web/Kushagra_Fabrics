import type { MetadataRoute } from "next";

const siteUrl = "https://kushagrafabrics.com";

const ROUTES = [
  "",
  "/fabrics",
  "/boxes",
  "/build",
  "/corporate",
  "/about",
  "/faq",
  "/delivery",
  "/care",
  "/returns",
  "/contact",
  "/privacy",
  "/terms",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({ url: `${siteUrl}${route}` }));
}
