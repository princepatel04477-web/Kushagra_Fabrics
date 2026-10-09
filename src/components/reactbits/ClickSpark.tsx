"use client";

/**
 * React Bits — ClickSpark (TS + Tailwind variant), restyled to Kushagra
 * tokens. https://reactbits.dev — hand-ported into src/components/reactbits
 *
 * Assigned to: the "Add to bag" button (src/components/builder/Builder.tsx).
 * One location.
 *
 * On click, eight thread-coloured sparks radiate from the click point and
 * fade out over 0.4s. Drawn with motion spans (transform + opacity only)
 * instead of the original canvas.
 */

import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/cn";
import { color, easeTailorBezier } from "@/lib/tokens";

export interface ClickSparkProps {
  readonly children: ReactNode;
  /** Sparks per click. Default 8. */
  readonly sparkCount?: number;
  /** Seconds each spark lives. Default 0.4. */
  readonly duration?: number;
  readonly className?: string;
}

interface Spark {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly angle: number;
}

/** How far a spark travels, px. */
const SPARK_RADIUS = 26;
/** Length of one spark line, px. */
const SPARK_LENGTH = 12;

export function ClickSpark({
  children,
  sparkCount = 8,
  duration = 0.4,
  className,
}: ClickSparkProps) {
  const [sparks, setSparks] = useState<readonly Spark[]>([]);
  const nextId = useRef(0);
  const clearTimer = useRef<number | null>(null);

  const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const burst = Array.from({ length: sparkCount }, (_, index) => ({
      id: nextId.current + index,
      x,
      y,
      angle: (360 / sparkCount) * index,
    }));
    nextId.current += sparkCount;
    setSparks(burst);
    if (clearTimer.current !== null) {
      window.clearTimeout(clearTimer.current);
    }
    clearTimer.current = window.setTimeout(() => {
      clearTimer.current = null;
      setSparks([]);
    }, duration * 1000);
  };

  return (
    <span className={cn("relative inline-block", className)} onClick={handleClick}>
      {children}
      {sparks.map((spark) => (
        <SparkLine key={spark.id} spark={spark} duration={duration} />
      ))}
    </span>
  );
}

function SparkLine({
  spark,
  duration,
}: {
  readonly spark: Spark;
  readonly duration: number;
}) {
  const radians = (spark.angle * Math.PI) / 180;
  return (
    <motion.span
      aria-hidden="true"
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: Math.cos(radians) * SPARK_RADIUS,
        y: Math.sin(radians) * SPARK_RADIUS,
        opacity: 0,
        scale: 0.3,
      }}
      transition={{ duration, ease: easeTailorBezier }}
      className="pointer-events-none absolute h-[2px] rounded-pill"
      style={{
        left: spark.x,
        top: spark.y,
        width: SPARK_LENGTH,
        rotate: spark.angle,
        transformOrigin: "left center",
        backgroundColor: color.thread,
      }}
    />
  );
}

export default ClickSpark;
