"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

import { useSmoothScroll } from "@/components/providers/SmoothScroll";

/**
 * One way to travel, for every link and CTA on the site.
 *
 * - "#how" or "/#how" while on "/" → Lenis scrolls to it under the nav.
 * - "/fabrics" while on "/fabrics"  → Lenis scrolls back to the top.
 * - anything else                   → router.push, with Next's own scroll
 *   reset turned off: SmoothScroll resets scroll on the route change, so
 *   Lenis stays the only scroll source.
 *
 * Always releases a scroll lock first, so a menu that is still animating
 * closed can never leave the new page frozen.
 */
export function useNavigate(): (href: string) => void {
  const router = useRouter();
  const pathname = usePathname();
  const { scrollTo, scrollToTop, start } = useSmoothScroll();

  return useCallback(
    (href: string) => {
      start();

      const hashAt = href.indexOf("#");
      const path = hashAt === -1 ? href : href.slice(0, hashAt);
      const hash = hashAt === -1 ? "" : href.slice(hashAt);

      if (path === "" || path === pathname) {
        if (hash !== "") {
          scrollTo(hash);
        } else {
          scrollToTop();
        }
        return;
      }

      router.push(href, { scroll: false });
    },
    [pathname, router, scrollTo, scrollToTop, start],
  );
}
