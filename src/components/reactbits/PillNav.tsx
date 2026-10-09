"use client";

/**
 * Adapted from the React Bits "PillNav" component (TS + Tailwind variant,
 * shadcn registry: https://reactbits.dev/r/PillNav-TS-TW).
 * The registry was unreachable in this environment, so the TS-TW source
 * was vendored from the official DavidHDev/react-bits GitHub repository
 * and restyled to Kushagra design tokens.
 *
 * Behaviour kept from the original: a single sliding highlight pill with
 * smooth easing between links. Restyled: one shared suiting-coloured pill
 * (transform + opacity only) with shirting text revealed on hover/focus.
 * Assigned location: the centre link cluster of src/components/chrome/Nav.tsx.
 */

import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { tokens } from "@/lib/tokens";

export interface PillNavItem {
  label: string;
  href: string;
  ariaLabel?: string;
}

export interface PillNavProps {
  items: readonly PillNavItem[];
  onNavigate: (href: string) => void;
  activeHref?: string;
  className?: string;
}

export function PillNav({ items, onNavigate, activeHref, className }: PillNavProps) {
  const pillRef = useRef<HTMLSpanElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const widthRef = useRef(0);
  const reduced = useReducedMotion();

  const placePill = useCallback(
    (link: HTMLElement | null, instant: boolean) => {
      const pill = pillRef.current;
      if (!pill || !link) return;
      const x = link.offsetLeft;
      const width = link.offsetWidth;
      if (width === 0) return;
      pill.style.width = `${width}px`;
      if (instant || reduced) {
        gsap.set(pill, { x, scaleX: 1, opacity: 1 });
        widthRef.current = width;
        return;
      }
      const previous = widthRef.current || width;
      gsap.fromTo(
        pill,
        { x, scaleX: previous / width, opacity: 1 },
        {
          x,
          scaleX: 1,
          opacity: 1,
          duration: 0.45,
          ease: tokens.ease.tailorGsap,
        },
      );
      widthRef.current = width;
    },
    [reduced],
  );

  const hidePill = useCallback(() => {
    const pill = pillRef.current;
    if (!pill) return;
    gsap.to(pill, { opacity: 0, duration: 0.25, ease: "power2.out" });
  }, []);

  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => {
      if (!alive) return;
      const active = listRef.current?.querySelector<HTMLElement>(
        "[data-active='true']",
      );
      if (active) placePill(active, true);
    });
    return () => {
      alive = false;
    };
  }, [placePill, items]);

  return (
    <nav aria-label="Sections" className={cn("relative", className)}>
      <ul
        ref={listRef}
        className="relative flex items-center gap-1 rounded-pill p-1"
        onMouseLeave={hidePill}
      >
        <span
          ref={pillRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-1 bottom-1 left-0 rounded-pill bg-suiting opacity-0 will-change-transform"
          style={{ width: 0 }}
        />
        {items.map((item) => {
          const active = activeHref === item.href;
          return (
            <li key={item.href}>
              <a
                href={item.href}
                data-active={active || undefined}
                aria-label={item.ariaLabel ?? item.label}
                aria-current={active ? "true" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(item.href);
                }}
                onMouseEnter={(event) => placePill(event.currentTarget, false)}
                onFocus={(event) => placePill(event.currentTarget, false)}
                className="group relative flex h-9 items-center rounded-pill px-4 text-[15px] font-medium"
              >
                <span className="relative block leading-none">
                  <span className="block text-suiting transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-0">
                    {item.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 block text-shirting opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    {item.label}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default PillNav;
