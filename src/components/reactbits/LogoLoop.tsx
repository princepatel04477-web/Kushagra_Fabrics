"use client";

/**
 * React Bits — LogoLoop (TS + Tailwind variant), restyled to Kushagra tokens.
 * https://reactbits.dev — hand-ported into src/components/reactbits
 *
 * Assigned to: the corporate client row (src/components/corporate/Corporate.tsx).
 * One location.
 *
 * A seamless horizontal marquee. The track holds two identical copies of the
 * row and translates by exactly one copy width (measured from the DOM and
 * passed to the keyframe through --loop-shift), so the loop never gaps or
 * jumps. Speed is px/second, converted to a duration. Hovering the row
 * pauses it; both ends fade out with a mask-image. Under reduced motion the
 * animation never starts and the row sits static.
 */

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/cn";

/** Inline style allowing the --loop-shift custom property the keyframe reads. */
type LoopStyle = CSSProperties & Record<`--${string}`, string>;

interface LogoLoopProps {
  /** The items of the row, rendered as wordmarks. */
  readonly names: readonly string[];
  /** Travel speed in px per second. */
  readonly speed?: number;
  readonly className?: string;
}

/** Edge fade — transparent for the outer 8% on each side. */
const EDGE_MASK =
  "linear-gradient(to right, transparent, black 8%, black 92%, transparent)";

export function LogoLoop({ names, speed = 40, className }: LogoLoopProps) {
  const prefersReducedMotion = useReducedMotion();
  const reduced = prefersReducedMotion === true;

  const copyRef = useRef<HTMLDivElement | null>(null);
  const [copyWidth, setCopyWidth] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      const el = copyRef.current;
      if (el !== null) setCopyWidth(el.getBoundingClientRect().width);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const duration = copyWidth > 0 ? copyWidth / speed : 0;

  const loopStyle: LoopStyle | undefined =
    reduced || duration === 0
      ? undefined
      : {
          animationName: "logo-loop",
          animationDuration: `${duration.toFixed(2)}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          "--loop-shift": `${(-copyWidth).toFixed(1)}px`,
        };

  return (
    <div
      aria-hidden="true"
      className={cn("group overflow-hidden", className)}
      style={{ maskImage: EDGE_MASK, WebkitMaskImage: EDGE_MASK }}
    >
      <div
        className="flex w-max group-hover:[animation-play-state:paused]"
        style={loopStyle}
      >
        <div ref={copyRef} className="flex shrink-0 items-center">
          {names.map((name) => (
            <span
              key={name}
              className="pr-14 font-semibold whitespace-nowrap"
            >
              {name}
            </span>
          ))}
        </div>
        {!reduced ? (
          <div className="flex shrink-0 items-center">
            {names.map((name) => (
              <span
                key={name}
                className="pr-14 font-semibold whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
