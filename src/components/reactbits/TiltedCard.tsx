"use client";

/**
 * React Bits — TiltedCard (TS + Tailwind variant), restyled to Kushagra
 * tokens. https://reactbits.dev — hand-ported into src/components/reactbits
 *
 * Assigned to: the box tiers (src/components/boxes/BoxTiers.tsx).
 * One location.
 *
 * A 3D tilt that follows the cursor: max 10deg per axis, perspective 900px,
 * scale 1.03 on hover, spring back on leave. Disabled on touch devices and
 * under prefers-reduced-motion, where the card renders flat. The React Bits
 * default caption, tooltip and mobile warning are turned off — the card
 * content is passed as children.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type SpringOptions,
} from "motion/react";

import { cn } from "@/lib/cn";

export interface TiltedCardProps {
  readonly children: ReactNode;
  /** Max tilt per axis, in degrees. Default 10. */
  readonly rotateAmplitude?: number;
  /** Scale while hovered. Default 1.03. */
  readonly scaleOnHover?: number;
  readonly className?: string;
}

const SPRING: SpringOptions = {
  damping: 30,
  stiffness: 100,
  mass: 2,
};

export function TiltedCard({
  children,
  rotateAmplitude = 10,
  scaleOnHover = 1.03,
  className,
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null);
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

  const rotateX = useSpring(useMotionValue(0), SPRING);
  const rotateY = useSpring(useMotionValue(0), SPRING);
  const scale = useSpring(useMotionValue(1), SPRING);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!active || ref.current === null) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude);
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude);
  };

  const handleMouseEnter = () => {
    if (active) scale.set(scaleOnHover);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("relative w-full [perspective:900px]", className)}
    >
      <motion.div
        className="h-full w-full [transform-style:preserve-3d]"
        style={{ rotateX, rotateY, scale }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default TiltedCard;
