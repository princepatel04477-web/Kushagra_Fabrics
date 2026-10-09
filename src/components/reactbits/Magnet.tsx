"use client";

/**
 * React Bits — Magnet (TS + Tailwind variant), restyled to Kushagra tokens.
 * https://reactbits.dev — hand-ported into src/components/reactbits
 *
 * Assigned to: the "Add to bag" button (src/components/builder/Builder.tsx).
 * One location.
 *
 * The wrapped element is pulled toward the cursor while it hovers nearby and
 * springs back on leave. Disabled on touch devices and under
 * prefers-reduced-motion, where it renders static.
 */

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/cn";

export interface MagnetProps {
  readonly children: ReactNode;
  /** Pull strength, as a fraction of the cursor's offset from centre. Default 0.3. */
  readonly strength?: number;
  readonly className?: string;
}

export function Magnet({ children, strength = 0.3, className }: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [canHover, setCanHover] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const active = canHover && reduced !== true;

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!active || ref.current === null) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setOffset({
      x: (event.clientX - centerX) * strength,
      y: (event.clientY - centerY) * strength,
    });
  };

  const handleMouseLeave = () => setOffset({ x: 0, y: 0 });

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative inline-block", className)}
    >
      <motion.div
        animate={{ x: offset.x, y: offset.y }}
        transition={{ type: "spring", stiffness: 220, damping: 18, mass: 0.6 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default Magnet;
