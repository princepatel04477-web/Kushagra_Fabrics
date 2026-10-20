import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HeroLab } from "@/components/home/hero/HeroLab";

/**
 * P0 spike for the WebGL unboxing (docs/HERO_PLAN.md). Development only:
 * production builds answer 404 and the route is never in the sitemap.
 * Add ?p=0.5 to freeze the scene at a progress value for screenshots.
 */

export const metadata: Metadata = {
  title: "Hero lab",
  robots: { index: false, follow: false },
};

export default function HeroLabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main id="main" tabIndex={-1}>
      <HeroLab />
    </main>
  );
}
