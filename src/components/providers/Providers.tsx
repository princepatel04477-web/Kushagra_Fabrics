"use client";

import { MotionConfig } from "motion/react";
import { useEffect, type ReactNode } from "react";

import { useGiftStore } from "@/store/gift";

import { SmoothScroll } from "./SmoothScroll";

/**
 * Wraps the whole app.
 *
 * MotionConfig reducedMotion="user" makes every motion/react animation respect
 * the OS setting without a useReducedMotion check at each call site; GSAP and
 * Lenis are guarded explicitly because they sit outside React's tree.
 */
export function Providers({ children }: { children: ReactNode }) {
  // The bag persists with skipHydration so the server and first client render
  // match. Rehydration therefore has to be kicked off by hand.
  useEffect(() => {
    void useGiftStore.persist.rehydrate();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>{children}</SmoothScroll>
    </MotionConfig>
  );
}
