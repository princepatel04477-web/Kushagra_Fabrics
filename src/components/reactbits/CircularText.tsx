"use client";

/**
 * React Bits — CircularText (TS + Tailwind variant), restyled to Kushagra
 * tokens. https://reactbits.dev — hand-ported into src/components/reactbits
 *
 * Assigned to: the rotating badge in the footer (src/components/chrome/Footer.tsx).
 * One location.
 *
 * A string of characters laid out around a circle — each character gets its
 * own rotate transform — spinning slowly. The rotation is driven by rAF
 * rather than a CSS animation so the speed can ease between the resting
 * pace (baseSeconds per turn) and the hover pace (hoverSeconds per turn)
 * without a phase jump. Under prefers-reduced-motion there is no rotation.
 * Anything passed as children sits still in the centre.
 */

import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/cn";

interface CircularTextProps {
  /** The string laid around the circle — spaces included, one slot each. */
  readonly text: string;
  /** Diameter of the badge in px. */
  readonly size?: number;
  /** Seconds per turn at rest. */
  readonly baseSeconds?: number;
  /** Seconds per turn while hovered. */
  readonly hoverSeconds?: number;
  readonly className?: string;
  /** Centre content, e.g. the brand mark. */
  readonly children?: ReactNode;
}

export function CircularText({
  text,
  size = 140,
  baseSeconds = 20,
  hoverSeconds = 6,
  className,
  children,
}: CircularTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const reduced = prefersReducedMotion === true;

  const ringRef = useRef<HTMLDivElement | null>(null);
  const hoveringRef = useRef(false);

  useEffect(() => {
    if (reduced) return;
    const ring = ringRef.current;
    if (ring === null) return;

    let frame = 0;
    let angle = 0;
    let speed = 360 / baseSeconds; // deg per second, current
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const target = hoveringRef.current
        ? 360 / hoverSeconds
        : 360 / baseSeconds;
      speed += (target - speed) * Math.min(1, dt * 5);
      angle = (angle + speed * dt) % 360;
      ring.style.transform = `rotate(${angle.toFixed(2)}deg)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced, baseSeconds, hoverSeconds]);

  const characters = Array.from(text);
  const step = 360 / characters.length;

  return (
    <div
      aria-hidden="true"
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      onMouseEnter={() => {
        hoveringRef.current = true;
      }}
      onMouseLeave={() => {
        hoveringRef.current = false;
      }}
    >
      <div ref={ringRef} className="absolute inset-0 will-change-transform">
        {characters.map((char, index) => (
          <span
            key={`${char}-${index}`}
            className="absolute inset-0 flex justify-center"
            style={{ transform: `rotate(${(index * step).toFixed(2)}deg)` }}
          >
            <span
              className="absolute font-semibold uppercase"
              style={{
                top: 0,
                fontSize: Math.max(10, size * 0.075),
                letterSpacing: "0.08em",
              }}
            >
              {char}
            </span>
          </span>
        ))}
      </div>
      {children !== undefined ? (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      ) : null}
    </div>
  );
}
