"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import {
  StaggeredMenu,
  type StaggeredMenuItem,
} from "@/components/reactbits/StaggeredMenu";

const MENU_ITEMS: readonly StaggeredMenuItem[] = [
  { label: "Occasions", href: "#occasions" },
  { label: "Fabrics", href: "#fabrics" },
  { label: "Boxes", href: "#boxes" },
  { label: "Corporate", href: "#corporate" },
  { label: "Build a gift", href: "#builder" },
] as const;

/**
 * Mobile navigation under 900px: a hamburger that morphs into an X and
 * the React Bits StaggeredMenu overlay. Escape and link taps close it,
 * scrolling is locked through Lenis and focus is trapped while open.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const wasOpen = useRef(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const trapRef = useRef<HTMLDivElement | null>(null);
  const { scrollTo, stop, start, enabled } = useSmoothScroll();

  /* Scroll lock while open: Lenis stop() (+ body fallback when Lenis is off) */
  useEffect(() => {
    if (!open) return;
    stop();
    if (!enabled) document.body.style.overflow = "hidden";
    return () => {
      start();
      if (!enabled) document.body.style.overflow = "";
    };
  }, [open, stop, start, enabled]);

  /* Escape closes, Tab is trapped between the toggle and the menu links */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const scope = trapRef.current;
      if (!scope) return;
      const focusables = Array.from(
        scope.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      ).filter((element) => element.getClientRects().length > 0);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const timer = window.setTimeout(() => {
      trapRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
    }, 480);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
    };
  }, [open]);

  /* Return focus to the toggle after closing (never on first mount) */
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      buttonRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  const navigate = (href: string) => {
    start();
    scrollTo(href.replace("#", ""));
  };

  return (
    <div ref={trapRef} className="contents min-[900px]:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded-pill"
      >
        <span className="relative block h-4 w-5" aria-hidden="true">
          <motion.span
            animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-1/2 left-0 block h-0.5 w-5 rounded-pill bg-suiting"
          />
          <motion.span
            animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-1/2 left-0 block h-0.5 w-5 rounded-pill bg-suiting"
          />
        </span>
      </button>
      <StaggeredMenu
        open={open}
        items={MENU_ITEMS}
        onNavigate={navigate}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
