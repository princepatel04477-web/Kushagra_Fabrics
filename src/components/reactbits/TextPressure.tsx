"use client";

/**
 * React Bits — TextPressure (TS + Tailwind variant), restyled to Kushagra
 * tokens. https://reactbits.dev — hand-ported into src/components/reactbits
 *
 * Assigned to: the giant footer wordmark (src/components/chrome/Footer.tsx).
 * One location. Needs a variable font with a weight axis — the layout loads
 * Bodoni Moda as a variable font (wght 400–900) for exactly this.
 *
 * Every letter is a span. Each frame, the distance from the cursor to the
 * letter's centre sets a target font-weight (up to 900) and scaleY (up to
 * 1.15); letters ease toward their target, so they return smoothly when the
 * cursor leaves. Everything runs in one rAF loop writing style properties
 * directly — no React state per frame. On touch devices (hover: none) and
 * under prefers-reduced-motion the wordmark sits static at base weight.
 */

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/cn";

interface TextPressureProps {
  readonly text: string;
  readonly className?: string;
}

const BASE_WEIGHT = 400;
const MAX_WEIGHT = 900;
const BASE_SCALE = 1;
const MAX_SCALE = 1.15;
/** Cursor influence radius, in px. */
const RADIUS = 300;
/** Per-frame easing toward the target. */
const STIFFNESS = 0.16;

interface LetterState {
  el: HTMLSpanElement;
  cx: number;
  cy: number;
  weight: number;
  scale: number;
}

export function TextPressure({ text, className }: TextPressureProps) {
  const prefersReducedMotion = useReducedMotion();
  const reduced = prefersReducedMotion === true;

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (reduced) return;
    // Touch devices get a static wordmark.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    const wrap = wrapRef.current;
    if (wrap === null) return;

    let letters: LetterState[] = [];
    const pointer = { x: 0, y: 0, active: false };

    const measure = () => {
      letters = spanRefs.current.flatMap((el, index) => {
        if (el === null) return [];
        const rect = el.getBoundingClientRect();
        const previous = letters[index];
        return [
          {
            el,
            cx: rect.left + rect.width / 2,
            cy: rect.top + rect.height / 2,
            weight: previous?.weight ?? BASE_WEIGHT,
            scale: previous?.scale ?? BASE_SCALE,
          },
        ];
      });
    };
    measure();

    // Throttled by design: the handler only stores the latest position; all
    // measurement and style writes happen once per frame in the rAF loop.
    const handleMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };
    const handleLeave = () => {
      pointer.active = false;
    };
    const handleResize = () => measure();

    wrap.addEventListener("pointermove", handleMove);
    wrap.addEventListener("pointerleave", handleLeave);
    window.addEventListener("scroll", handleResize, { passive: true });
    window.addEventListener("resize", handleResize);

    let frame = 0;
    const tick = () => {
      for (const letter of letters) {
        let targetWeight = BASE_WEIGHT;
        let targetScale = BASE_SCALE;
        if (pointer.active) {
          const distance = Math.hypot(
            pointer.x - letter.cx,
            pointer.y - letter.cy,
          );
          const t = Math.max(0, 1 - distance / RADIUS);
          const influence = t * t * (3 - 2 * t); // smoothstep
          targetWeight = BASE_WEIGHT + (MAX_WEIGHT - BASE_WEIGHT) * influence;
          targetScale = BASE_SCALE + (MAX_SCALE - BASE_SCALE) * influence;
        }
        letter.weight += (targetWeight - letter.weight) * STIFFNESS;
        letter.scale += (targetScale - letter.scale) * STIFFNESS;
        letter.el.style.fontWeight = `${Math.round(letter.weight)}`;
        letter.el.style.transform = `scaleY(${letter.scale.toFixed(4)})`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      wrap.removeEventListener("pointermove", handleMove);
      wrap.removeEventListener("pointerleave", handleLeave);
      window.removeEventListener("scroll", handleResize);
      window.removeEventListener("resize", handleResize);
    };
  }, [reduced]);

  return (
    <div
      ref={wrapRef}
      aria-label={text}
      className={cn("flex w-full select-none", className)}
    >
      {Array.from(text).map((char, index) => (
        <span
          key={`${char}-${index}`}
          ref={(el) => {
            spanRefs.current[index] = el;
          }}
          aria-hidden="true"
          className="flex-1 text-center leading-none will-change-transform"
          style={{ transformOrigin: "50% 100%" }}
        >
          {char}
        </span>
      ))}
    </div>
  );
}
