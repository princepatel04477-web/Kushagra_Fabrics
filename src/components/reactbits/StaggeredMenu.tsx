"use client";

/**
 * React Bits — StaggeredMenu (TS + Tailwind variant), restyled to Kushagra
 * tokens. https://reactbits.dev — installed into src/components/reactbits
 *
 * Assigned to: the mobile menu, under 900px. One location.
 *
 * Three panels sweep in from the right, 0.08s apart (suiting, then chalk, then
 * paper on top). Links rise 0.06s apart once the panels are down. Escape and a
 * link tap both close it; focus is trapped inside while it is open.
 *
 * motion/react owns the mount/unmount; the scroll freeze is delegated back to
 * Lenis through the caller so there is still only one scroll source.
 */

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import { useMounted } from "@/lib/useMounted";
import { cn } from "@/lib/cn";
import { color, easeTailorBezier } from "@/lib/tokens";

const PANEL_BACKGROUNDS: readonly string[] = [
  color.suiting,
  color.chalk,
  color.paper,
];

const PANEL_STAGGER = 0.08;
const LINK_STAGGER = 0.06;
const LINK_START = 0.2;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface StaggeredMenuItem {
  readonly label: string;
  readonly href: string;
  readonly ariaLabel?: string;
}

export interface StaggeredMenuProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly items: readonly StaggeredMenuItem[];
  readonly onNavigate?: (href: string) => void;
  /** Rendered under the links — used for the bag and the primary action. */
  readonly footer?: ReactNode;
  readonly className?: string;
}

export function StaggeredMenu({
  open,
  onOpenChange,
  items,
  onNavigate,
  footer,
  className,
}: StaggeredMenuProps) {
  const menuId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);
  const mounted = useMounted();

  // Focus trap, Escape to close, focus restored to the trigger on close.
  useEffect(() => {
    if (!open) return;

    returnFocusTo.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const panelItems = (): HTMLElement[] => {
      const root = panelRef.current;
      if (root === null) return [];
      return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
    };

    /** Tab order: the trigger first, then everything inside the dialog. */
    const focusables = (): HTMLElement[] => {
      // The trigger lives outside the dialog — the floating bar is layered
      // above the panels so it stays reachable — so the cycle covers both.
      const trigger = document.querySelector<HTMLElement>("[data-menu-trigger]");
      const inside = panelItems();
      return trigger === null ? inside : [trigger, ...inside];
    };

    // Land on the menu content, not back on the button that was just pressed.
    const entry = panelItems()[0] ?? focusables()[0];
    (entry ?? panelRef.current)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
        return;
      }
      if (event.key !== "Tab") return;

      const list = focusables();
      const firstItem = list[0];
      const lastItem = list[list.length - 1];
      if (firstItem === undefined || lastItem === undefined) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      returnFocusTo.current?.focus();
    };
  }, [open, onOpenChange]);

  const handleNavigate = (href: string) => {
    onOpenChange(false);
    onNavigate?.(href);
  };

  const trigger = (
    <button
      type="button"
      data-menu-trigger
      aria-expanded={open}
      aria-controls={mounted ? menuId : undefined}
      aria-label={open ? "Close menu" : "Open menu"}
      onClick={() => onOpenChange(!open)}
      className={cn(
        "relative grid h-11 w-11 shrink-0 place-items-center rounded-pill",
        "border border-line bg-paper/85 backdrop-blur-[14px]",
        className,
      )}
    >
      <span className="relative block h-3 w-5" aria-hidden="true">
        <motion.span
          className="absolute left-0 top-1/2 block h-[1.5px] w-5 origin-center rounded-pill bg-suiting"
          initial={false}
          animate={{ y: open ? 0 : -4, rotate: open ? 45 : 0 }}
          transition={{ duration: 0.35, ease: easeTailorBezier }}
        />
        <motion.span
          className="absolute left-0 top-1/2 block h-[1.5px] w-5 origin-center rounded-pill bg-suiting"
          initial={false}
          animate={{ y: open ? 0 : 4, rotate: open ? -45 : 0 }}
          transition={{ duration: 0.35, ease: easeTailorBezier }}
        />
      </span>
    </button>
  );

  const overlay = (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="staggered-menu"
          id={menuId}
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          tabIndex={-1}
          className="fixed inset-0 z-[120] overflow-hidden outline-none"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {PANEL_BACKGROUNDS.map((background, index) => (
            <motion.div
              key={background}
              aria-hidden="true"
              className="absolute inset-0"
              style={{ backgroundColor: background, zIndex: index }}
              variants={{
                hidden: {
                  x: "100%",
                  transition: {
                    duration: 0.45,
                    ease: easeTailorBezier,
                    delay: (PANEL_BACKGROUNDS.length - 1 - index) * 0.05,
                  },
                },
                visible: {
                  x: 0,
                  transition: {
                    duration: 0.6,
                    ease: easeTailorBezier,
                    delay: index * PANEL_STAGGER,
                  },
                },
              }}
            />
          ))}

          <div className="relative z-10 flex h-full flex-col justify-between px-[clamp(20px,5vw,64px)] pb-10 pt-[104px]">
            <nav aria-label="Sections">
              <ul className="flex flex-col gap-2">
                {items.map((item, index) => (
                  <motion.li
                    key={item.href}
                    variants={{
                      hidden: {
                        opacity: 0,
                        y: 26,
                        transition: { duration: 0.22, ease: easeTailorBezier },
                      },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.5,
                          ease: easeTailorBezier,
                          delay: LINK_START + index * LINK_STAGGER,
                        },
                      },
                    }}
                  >
                    <a
                      href={item.href}
                      aria-label={item.ariaLabel}
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
                        handleNavigate(item.href);
                      }}
                      className="inline-block py-1 font-display text-[2.5rem] leading-[1.1] tracking-[-0.02em] text-suiting"
                    >
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>

            {footer !== undefined ? (
              <motion.div
                className="flex flex-col gap-4"
                variants={{
                  hidden: {
                    opacity: 0,
                    transition: { duration: 0.2, ease: easeTailorBezier },
                  },
                  visible: {
                    opacity: 1,
                    transition: {
                      duration: 0.45,
                      ease: easeTailorBezier,
                      delay: LINK_START + items.length * LINK_STAGGER,
                    },
                  },
                }}
              >
                <div className="stitch-line" aria-hidden="true" />
                {footer}
              </motion.div>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <>
      {trigger}
      {mounted ? createPortal(overlay, document.body) : null}
    </>
  );
}

export default StaggeredMenu;
