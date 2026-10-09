"use client";

/**
 * The bag drawer: slides in from the right (420px on desktop, full width on
 * mobile) over a dimmed backdrop, paper surface, Lenis stopped while open.
 * Escape closes it, focus is trapped inside, and focus returns to the bag
 * button in the nav. Lines come from the persisted Phase 1 store; the drawer
 * only ever renders after mount (it opens on a click), so the persisted bag
 * never causes a hydration mismatch.
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { useGiftStore, useBagTotal } from "@/store/gift";
import { formatINR } from "@/lib/format";
import { easeTailorBezier } from "@/lib/tokens";

import { BagLine } from "./BagLine";
import { CheckoutPanel } from "./CheckoutPanel";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3 3l10 10M13 3L3 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BagDrawer() {
  const open = useGiftStore((state) => state.bagOpen);
  const closeBag = useGiftStore((state) => state.closeBag);
  const lines = useGiftStore((state) => state.lines);
  const total = useBagTotal();
  const { stop, start, scrollTo } = useSmoothScroll();

  const [mounted, setMounted] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);

  // The portal target only exists on the client.
  useEffect(() => setMounted(true), []);

  // Scroll lock while open — through Lenis, never overflow: hidden.
  useEffect(() => {
    if (open) {
      stop();
    } else {
      start();
    }
    return () => {
      start();
    };
  }, [open, stop, start]);

  // Escape closes; remember the bag button to hand focus back to.
  useEffect(() => {
    if (!open) return;
    returnFocusRef.current =
      document.querySelector<HTMLElement>("[data-bag-button]");
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeBag();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeBag]);

  // Focus the panel on open; return focus (and reset checkout) on close.
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      panelRef.current?.focus();
    } else if (wasOpen.current) {
      wasOpen.current = false;
      setCheckout(false);
      returnFocusRef.current?.focus();
    }
  }, [open]);

  // Focus trap while open (re-bound when the checkout panel swaps content).
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (panel === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((element) => element.offsetParent !== null);
      const first = items[0];
      const last = items[items.length - 1];
      if (first === undefined || last === undefined) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    panel.addEventListener("keydown", onKeyDown);
    return () => panel.removeEventListener("keydown", onKeyDown);
  }, [open, checkout]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[140]">
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: easeTailorBezier }}
            onClick={closeBag}
            className="absolute inset-0 bg-suiting/50"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            tabIndex={-1}
            ref={panelRef}
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: easeTailorBezier }}
            className="absolute inset-y-0 right-0 flex w-[420px] max-w-full flex-col border-l border-line bg-paper"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="text-[1.5rem] text-suiting">Your bag</h2>
              <button
                type="button"
                onClick={closeBag}
                aria-label="Close bag"
                className="grid h-10 w-10 place-items-center rounded-pill border border-line text-suiting transition-colors duration-300 hover:bg-suiting hover:text-shirting"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <AnimatePresence mode="wait" initial={false}>
                {checkout ? (
                  <motion.div
                    key="checkout"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: easeTailorBezier }}
                  >
                    <CheckoutPanel onBack={() => setCheckout(false)} />
                  </motion.div>
                ) : lines.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: easeTailorBezier }}
                    className="flex h-full flex-col items-start justify-center gap-5"
                  >
                    <p className="text-[1.0625rem] text-chalk">
                      Your bag is empty. Build a box to start.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        closeBag();
                        scrollTo("#builder");
                      }}
                      className="inline-flex h-12 items-center rounded-pill bg-red-deep px-7 text-[1rem] font-semibold text-white transition-opacity duration-300 hover:opacity-90"
                    >
                      Build a box
                    </button>
                  </motion.div>
                ) : (
                  <motion.ul
                    key="lines"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: easeTailorBezier }}
                  >
                    {lines.map((line) => (
                      <BagLine key={line.id} line={line} />
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {lines.length > 0 && !checkout ? (
              <div className="border-t border-line px-6 py-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-[0.9375rem] text-chalk">Subtotal</span>
                  <span
                    data-numeric
                    className="font-display text-[1.5rem] leading-none tracking-[-0.02em] text-suiting"
                  >
                    {formatINR(total)}
                  </span>
                </div>
                <p className="mt-1 text-[0.8125rem] text-chalk">
                  Free gift wrapping on every box. Delivery calculated at
                  checkout.
                </p>
                <button
                  type="button"
                  onClick={() => setCheckout(true)}
                  className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-pill bg-red-deep px-7 text-[1rem] font-semibold text-white transition-opacity duration-300 hover:opacity-90"
                >
                  Checkout
                </button>
              </div>
            ) : null}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
