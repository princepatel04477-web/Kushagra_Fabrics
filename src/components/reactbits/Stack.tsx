"use client";

/**
 * React Bits — Stack (TS + Tailwind variant), restyled to Kushagra tokens.
 * https://reactbits.dev — hand-ported into src/components/reactbits
 *
 * Assigned to: the fabric swatch book (src/components/fabrics/SwatchBook.tsx).
 * One location.
 *
 * A pile of swatches. The top card drags horizontally with mouse or touch
 * (touch-action stays pan-y, so vertical swipes still scroll the page);
 * drag it past the sensitivity and it flies out and tucks to the back of
 * the pile, otherwise it springs home. Rotations are seeded from the card's
 * index — never Math.random at render — so the server and the first client
 * render match exactly.
 *
 * The pile is a focusable group (role="group", aria-roledescription
 * "swatch book"): ArrowRight sends the top card to the back, ArrowLeft
 * brings the back card to the front, and a live region announces the top
 * swatch. motion/react owns the drag and the springs: this is a gesture,
 * not a scroll effect.
 */

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";

import { cn } from "@/lib/cn";

export interface StackItem {
  /** The card content. */
  readonly node: ReactNode;
  /** Spoken name of the card, for the live region. */
  readonly label: string;
}

export interface StackProps {
  readonly items: readonly StackItem[];
  /** px of drag past which the top card goes to the back. Default 140. */
  readonly sensitivity?: number;
  /** Seconds for the fly-out and return animations. Default 0.5. */
  readonly animationDuration?: number;
  /** Scale step per card down the pile. Default 0.02. */
  readonly scaleFactor?: number;
  /** Ref to the pile element — the weave lens tracks it. */
  readonly pileRef?: Ref<HTMLDivElement>;
  /** Rendered inside the pile, above the cards (the weave lens lives here). */
  readonly pileOverlay?: ReactNode;
  /** Called with the items index that is now on top. */
  readonly onTopChange?: (index: number) => void;
  readonly className?: string;
}

/** Deterministic rotation in [-6, 6] degrees, seeded from the card's index. */
function rotationFor(index: number): number {
  return ((index * 37) % 13) - 6;
}

interface StackCardProps {
  readonly item: StackItem;
  /** Index into the owner's items array — stable across reorders. */
  readonly index: number;
  readonly position: number;
  readonly total: number;
  readonly sensitivity: number;
  readonly animationDuration: number;
  readonly scaleFactor: number;
  readonly onSendToBack: () => void;
}

function StackCard({
  item,
  index,
  position,
  total,
  sensitivity,
  animationDuration,
  scaleFactor,
  onSendToBack,
}: StackCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const isTop = position === 0;
  const reduced = useReducedMotion();
  const timeoutRef = useRef<number | null>(null);

  // Never leave a pending fly-out behind when the card unmounts.
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    // Grabbed again mid-flight: cancel the pending tuck and start clean.
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      x.set(0);
      y.set(0);
    }

    const past =
      Math.abs(info.offset.x) > sensitivity ||
      Math.abs(info.offset.y) > sensitivity;

    if (past) {
      if (reduced === true) {
        onSendToBack();
        return;
      }
      // Fly out in the drag direction, then tuck under the pile.
      void animate(x, info.offset.x * 1.8, {
        duration: animationDuration * 0.6,
        ease: [0.55, 0, 1, 1],
      });
      void animate(y, info.offset.y * 1.8, {
        duration: animationDuration * 0.6,
        ease: [0.55, 0, 1, 1],
      });
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        onSendToBack();
        x.set(0);
        y.set(0);
      }, animationDuration * 600);
      return;
    }

    if (reduced === true) {
      x.set(0);
      y.set(0);
      return;
    }
    const spring = { type: "spring", stiffness: 260, damping: 28 } as const;
    void animate(x, 0, spring);
    void animate(y, 0, spring);
  };

  return (
    <motion.div
      aria-hidden={isTop ? undefined : "true"}
      className={cn(
        "absolute inset-0 touch-pan-y select-none",
        isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none",
      )}
      style={{
        x,
        y,
        rotate: rotationFor(index),
        scale: 1 - position * scaleFactor,
        zIndex: total - position,
      }}
      drag={isTop ? "x" : false}
      dragMomentum={false}
      dragElastic={0.08}
      onDragEnd={handleDragEnd}
    >
      {item.node}
    </motion.div>
  );
}

export function Stack({
  items,
  sensitivity = 140,
  animationDuration = 0.5,
  scaleFactor = 0.02,
  pileRef,
  pileOverlay,
  onTopChange,
  className,
}: StackProps) {
  // Indices into `items`, top of the pile first.
  const [order, setOrder] = useState<readonly number[]>(() =>
    items.map((_, index) => index),
  );

  const topIndex = order[0] ?? 0;
  const topItem = items[topIndex];

  // Keep the owner in sync with the top of the pile.
  useEffect(() => {
    onTopChange?.(topIndex);
  }, [topIndex, onTopChange]);

  const sendTopToBack = useCallback(() => {
    setOrder((current) => {
      const top = current[0];
      if (top === undefined || current.length < 2) return current;
      return [...current.slice(1), top];
    });
  }, []);

  const bringBackToFront = useCallback(() => {
    setOrder((current) => {
      const last = current[current.length - 1];
      if (last === undefined || current.length < 2) return current;
      return [last, ...current.slice(0, -1)];
    });
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      sendTopToBack();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      bringBackToFront();
    }
  };

  return (
    <div
      role="group"
      aria-roledescription="swatch book"
      aria-label="Fabric swatch book"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn("flex flex-col items-center", className)}
    >
      <div
        ref={pileRef}
        className="relative h-[420px] w-[320px] max-w-full select-none"
      >
        {order.map((itemIndex, position) => {
          const item = items[itemIndex];
          if (item === undefined) return null;
          return (
            <StackCard
              key={itemIndex}
              item={item}
              index={itemIndex}
              position={position}
              total={order.length}
              sensitivity={sensitivity}
              animationDuration={animationDuration}
              scaleFactor={scaleFactor}
              onSendToBack={sendTopToBack}
            />
          );
        })}
        {pileOverlay}
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={bringBackToFront}
          className="inline-flex h-11 items-center rounded-pill border border-line px-5 font-body text-[0.9375rem] font-medium text-suiting transition-colors duration-300 ease-tailor hover:bg-suiting hover:text-shirting"
        >
          Previous swatch
        </button>
        <button
          type="button"
          onClick={sendTopToBack}
          className="inline-flex h-11 items-center rounded-pill border border-line px-5 font-body text-[0.9375rem] font-medium text-suiting transition-colors duration-300 ease-tailor hover:bg-suiting hover:text-shirting"
        >
          Next swatch
        </button>
      </div>

      <div aria-live="polite" className="sr-only">
        <span key={topIndex}>
          Top swatch: {topItem === undefined ? "" : topItem.label}
        </span>
      </div>
    </div>
  );
}

export default Stack;
