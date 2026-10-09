"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { SmoothScrollProvider } from "@/components/providers/SmoothScroll";

/**
 * App-wide animation + scroll providers.
 * MotionConfig reducedMotion="user" gives every motion component a
 * static fallback; SmoothScrollProvider disables Lenis itself.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
    </MotionConfig>
  );
}
