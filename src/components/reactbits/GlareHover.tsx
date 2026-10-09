"use client";

/**
 * React Bits — GlareHover (TS + Tailwind variant), restyled to Kushagra
 * tokens. https://reactbits.dev — hand-ported into src/components/reactbits
 *
 * Assigned to: the top swatch of the swatch book
 * (src/components/fabrics/SwatchBook.tsx). One location.
 *
 * One diagonal light band — white at 25% — sweeps across on hover in 0.7s
 * and sweeps back on leave. The band only renders on hover-capable devices
 * and is never rendered under prefers-reduced-motion, so the effect is
 * simply off there. motion/react owns the sweep: this is a hover gesture.
 */

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/cn";
import { easeTailorBezier } from "@/lib/tokens";

export interface GlareHoverProps {
  readonly children: ReactNode;
  /** Sweep duration in seconds. Default 0.7. */
  readonly duration?: number;
  readonly className?: string;
}

const sheenVariants = {
  rest: { x: "-160%" },
  hover: { x: "280%" },
};

export function GlareHover({
  children,
  duration = 0.7,
  className,
}: GlareHoverProps) {
  const reduced = useReducedMotion();
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const active = canHover && reduced !== true;

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      className={cn(
        "relative h-full w-full overflow-hidden rounded-m",
        className,
      )}
    >
      {children}
      {active ? (
        <motion.span
          aria-hidden="true"
          variants={sheenVariants}
          transition={{ duration, ease: easeTailorBezier }}
          className="pointer-events-none absolute inset-y-0 left-0 w-[45%] -skew-x-[18deg] bg-white/25"
        />
      ) : null}
    </motion.div>
  );
}

export default GlareHover;
