"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useNavigate } from "@/lib/useNavigate";
import { cn } from "@/lib/cn";

interface NavLinkProps {
  /** A page ("/fabrics"), a page and anchor ("/#how"), or an anchor ("#how"). */
  readonly href: string;
  readonly children: ReactNode;
  readonly className?: string;
  readonly "aria-current"?: "page";
}

/**
 * The site's link. A real next/link, so it prefetches and middle-click opens
 * a tab, but a plain click travels through useNavigate: same-page anchors
 * scroll with Lenis under the floating nav, other pages push without Next's
 * own scroll reset (SmoothScroll does that). Modifier-clicks fall through to
 * the browser.
 */
export function NavLink({
  href,
  children,
  className,
  "aria-current": ariaCurrent,
}: NavLinkProps) {
  const navigate = useNavigate();

  return (
    <Link
      href={href}
      scroll={false}
      aria-current={ariaCurrent}
      className={cn(className)}
      onClick={(event) => {
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }
        event.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </Link>
  );
}
