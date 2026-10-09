"use client";

/**
 * React Bits — CountUp (TS + Tailwind variant), restyled to Kushagra tokens.
 * https://reactbits.dev — hand-ported into src/components/reactbits
 *
 * Assigned to: the corporate stats row (src/components/corporate/Corporate.tsx).
 * One location.
 *
 * The number counts from 0 to `end` over `duration` ms with an ease-out
 * curve, starting once — the first time the element enters the viewport
 * (IntersectionObserver, then unobserved). Values are formatted with Indian
 * digit grouping (en-IN) and rendered with tabular numerals so the width
 * never jumps mid-count. Under prefers-reduced-motion the final value is
 * shown immediately, no counting.
 */

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/cn";

const formatter = new Intl.NumberFormat("en-IN");

interface CountUpProps {
  /** The exact value the counter lands on. */
  readonly end: number;
  /** Count duration in ms. */
  readonly duration?: number;
  /** Text after the number, e.g. "+". */
  readonly suffix?: string;
  readonly className?: string;
}

/** 1 - (1 - t)^3 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function CountUp({
  end,
  duration = 1600,
  suffix = "",
  className,
}: CountUpProps) {
  const prefersReducedMotion = useReducedMotion();
  const reduced = prefersReducedMotion === true;

  const spanRef = useRef<HTMLSpanElement | null>(null);
  const [started, setStarted] = useState(false);
  const [display, setDisplay] = useState(reduced ? end : 0);

  useEffect(() => {
    if (reduced) {
      setDisplay(end);
      return;
    }

    const el = spanRef.current;
    if (el === null) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry === undefined || !entry.isIntersecting || started) return;
        observer.disconnect();
        setStarted(true);

        const startTime = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - startTime) / duration);
          const value =
            progress >= 1 ? end : Math.round(end * easeOutCubic(progress));
          setDisplay(value);
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [end, duration, reduced, started]);

  return (
    <span ref={spanRef} data-numeric className={cn("tabular-nums", className)}>
      {formatter.format(display)}
      {suffix}
    </span>
  );
}
