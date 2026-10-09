"use client";

import type { ReactNode } from "react";

import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { cn } from "@/lib/cn";

interface ScrollLinkProps {
  /** An anchor on this page, e.g. "#builder". */
  readonly href: string;
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * An anchor that hands scrolling to Lenis so the target lands below the
 * floating nav instead of under it. Modifier-clicks fall through to the
 * browser so "open in new tab" still behaves normally.
 */
export function ScrollLink({ href, children, className }: ScrollLinkProps) {
  const { scrollTo } = useSmoothScroll();

  return (
    <a
      href={href}
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
        scrollTo(href);
      }}
    >
      {children}
    </a>
  );
}
