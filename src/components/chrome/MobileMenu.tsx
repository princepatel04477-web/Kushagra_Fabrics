"use client";

import { useCallback, useEffect, type ReactNode } from "react";

import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import {
  StaggeredMenu,
  type StaggeredMenuItem,
} from "@/components/reactbits/StaggeredMenu";
import { layout } from "@/lib/tokens";

interface MobileMenuProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly items: readonly StaggeredMenuItem[];
  /** Rendered under the links — the primary action lives here below 900px. */
  readonly footer?: ReactNode;
}

/**
 * Mobile shell for the nav, under 900px. The trigger and the panels live in
 * React Bits' StaggeredMenu; this component owns everything around it: the
 * scroll freeze (through Lenis, never a second scroll source), closing when the
 * viewport grows past the breakpoint, and handing navigation to the provider so
 * anchors land under the floating bar.
 */
export function MobileMenu({
  open,
  onOpenChange,
  items,
  footer,
}: MobileMenuProps) {
  const { scrollTo, start, stop } = useSmoothScroll();

  useEffect(() => {
    if (open) {
      stop();
    } else {
      start();
    }
    return () => {
      start();
    };
  }, [open, start, stop]);

  useEffect(() => {
    const query = window.matchMedia(
      `(min-width: ${layout.mobileBreakpoint}px)`,
    );
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) onOpenChange(false);
    };
    query.addEventListener("change", onChange);
    return () => {
      query.removeEventListener("change", onChange);
    };
  }, [onOpenChange]);

  // Runs while the panels are still animating out. The lock has to be released
  // first or Lenis would swallow the scroll.
  const handleNavigate = useCallback(
    (href: string) => {
      start();
      scrollTo(href);
    },
    [scrollTo, start],
  );

  return (
    <StaggeredMenu
      open={open}
      onOpenChange={onOpenChange}
      items={items}
      onNavigate={handleNavigate}
      footer={footer}
    />
  );
}
