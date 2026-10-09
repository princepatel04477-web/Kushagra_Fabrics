"use client";

/**
 * The weave lens: a 140px circle that follows the cursor over the swatch
 * pile and shows the top cloth's texture magnified 2.5× — a second
 * FabricTexture, scaled and translated so the point under the cursor sits at
 * the centre of the lens, behind a 1px suiting ring.
 *
 * Desktop and hover-capable only, and never under prefers-reduced-motion.
 * Pointer handlers are throttled with requestAnimationFrame.
 */

import { useEffect, useRef, useState, type RefObject } from "react";
import { useReducedMotion } from "motion/react";

import type { Fabric } from "@/lib/data";

import {
  FabricTexture,
  SWATCH_HEIGHT,
  SWATCH_WIDTH,
} from "./FabricTexture";

const LENS_SIZE = 140;
const MAGNIFICATION = 2.5;

interface LensPosition {
  /** Cursor position within the pile, px. */
  readonly x: number;
  readonly y: number;
  /** The same point in the swatch's canonical 320×420 coordinate space. */
  readonly px: number;
  readonly py: number;
}

export interface WeaveLensProps {
  /** The fabric currently on top of the pile. */
  readonly fabric: Fabric;
  /** The pile element the lens tracks. */
  readonly targetRef: RefObject<HTMLElement | null>;
}

export function WeaveLens({ fabric, targetRef }: WeaveLensProps) {
  const reduced = useReducedMotion();
  const [canHover, setCanHover] = useState(false);
  const [position, setPosition] = useState<LensPosition | null>(null);
  const frameRef = useRef<number | null>(null);
  const latestRef = useRef<{ clientX: number; clientY: number } | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const target = targetRef.current;
    if (!canHover || reduced === true || target === null) return;

    const flush = () => {
      frameRef.current = null;
      const point = latestRef.current;
      if (point === null) return;
      const rect = target.getBoundingClientRect();
      const x = point.clientX - rect.left;
      const y = point.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        setPosition(null);
        return;
      }
      setPosition({
        x,
        y,
        px: (x / rect.width) * SWATCH_WIDTH,
        py: (y / rect.height) * SWATCH_HEIGHT,
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      latestRef.current = { clientX: event.clientX, clientY: event.clientY };
      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(flush);
      }
    };

    const onPointerLeave = () => {
      latestRef.current = null;
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      setPosition(null);
    };

    target.addEventListener("pointermove", onPointerMove);
    target.addEventListener("pointerleave", onPointerLeave);
    return () => {
      target.removeEventListener("pointermove", onPointerMove);
      target.removeEventListener("pointerleave", onPointerLeave);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [canHover, reduced, targetRef]);

  if (!canHover || reduced === true || position === null) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-30 h-[140px] w-[140px] overflow-hidden rounded-full border border-suiting bg-paper"
      style={{
        left: position.x - LENS_SIZE / 2,
        top: position.y - LENS_SIZE / 2,
      }}
    >
      <div
        className="absolute left-0 top-0"
        style={{
          width: SWATCH_WIDTH,
          height: SWATCH_HEIGHT,
          transformOrigin: "0 0",
          transform: `translate(${LENS_SIZE / 2 - position.px * MAGNIFICATION}px, ${
            LENS_SIZE / 2 - position.py * MAGNIFICATION
          }px) scale(${MAGNIFICATION})`,
        }}
      >
        <FabricTexture fabric={fabric} />
      </div>
    </div>
  );
}
