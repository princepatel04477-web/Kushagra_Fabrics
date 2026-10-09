"use client";

import { useEffect, type ReactNode } from "react";

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
  readonly activeHref?: string;
  /** Travels to a page. Must release the scroll lock (useNavigate does). */
  readonly onNavigate: (href: string) => void;
  /** Rendered under the links — the primary action lives here below 900px. */
  readonly footer?: ReactNode;
}

/**
 * Mobile shell for the nav, under 900px. The trigger and the panels live in
 * React Bits' StaggeredMenu; this component owns everything around it: the
 * scroll freeze (through Lenis, never a second scroll source), closing when the
 * viewport grows past the breakpoint. Navigation is handed in by the nav
 * (useNavigate), which releases the lock before travelling.
 */
export function MobileMenu({
  open,
  onOpenChange,
  items,
  activeHref,
  onNavigate,
  footer,
}: MobileMenuProps) {
  const { start, stop } = useSmoothScroll();

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

  return (
    <StaggeredMenu
      open={open}
      onOpenChange={onOpenChange}
      items={items}
      activeHref={activeHref}
      onNavigate={onNavigate}
      footer={footer}
    />
  );
}
