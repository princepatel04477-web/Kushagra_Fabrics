"use client";

/**
 * React Bits — PillNav (TS + Tailwind variant), restyled to Kushagra tokens.
 * https://reactbits.dev — installed into src/components/reactbits
 *
 * Assigned to: the floating nav bar, desktop only (>= 900px). One location.
 *
 * There is exactly one moving pill. It is a shared-layout element
 * (layoutId) that unmounts from one link and mounts on the next, so motion
 * slides the same DOM node between them instead of cross-fading two pills.
 * motion/react owns it: this is a layout + gesture animation, not a scroll one.
 */

import { useState } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/cn";
import { duration as tokenDuration, easeTailorBezier } from "@/lib/tokens";

export interface PillNavItem {
  readonly label: string;
  readonly href: string;
  readonly ariaLabel?: string;
}

export interface PillNavProps {
  readonly items: readonly PillNavItem[];
  /** Current page, filled when nothing is hovered. */
  readonly activeHref?: string;
  readonly onNavigate?: (href: string) => void;
  readonly className?: string;
}

export function PillNav({
  items,
  activeHref,
  onNavigate,
  className,
}: PillNavProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const filled = hovered ?? activeHref ?? null;

  return (
    <nav aria-label="Pages" className={cn("flex items-center", className)}>
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const isFilled = filled === item.href;

          return (
            <li key={item.href}>
              <a
                href={item.href}
                aria-label={item.ariaLabel}
                aria-current={activeHref === item.href ? "page" : undefined}
                onMouseEnter={() => setHovered(item.href)}
                onMouseLeave={() =>
                  setHovered((current) =>
                    current === item.href ? null : current,
                  )
                }
                onFocus={() => setHovered(item.href)}
                onBlur={() =>
                  setHovered((current) =>
                    current === item.href ? null : current,
                  )
                }
                onClick={(event) => {
                  if (onNavigate === undefined) return;
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
                  onNavigate(item.href);
                }}
                className={cn(
                  "relative inline-flex items-center rounded-pill px-4 py-2 text-[0.9375rem] font-medium",
                  "transition-colors duration-300 ease-tailor",
                  isFilled ? "text-shirting" : "text-suiting",
                )}
              >
                {isFilled ? (
                  <motion.span
                    layoutId="kushagra-pill-nav"
                    aria-hidden="true"
                    className="absolute inset-0 rounded-pill bg-suiting"
                    transition={{
                      duration: tokenDuration.pill,
                      ease: easeTailorBezier,
                    }}
                  />
                ) : null}
                <span className="relative z-10">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default PillNav;
