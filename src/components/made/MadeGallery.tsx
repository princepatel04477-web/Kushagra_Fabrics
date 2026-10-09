"use client";

/**
 * What he made of it — a draggable, looping gallery of garments stitched
 * from Kushagra lengths, bent into a gentle arc.
 *
 * Ten cards (300x400) sit on an invisible horizontal line. Every frame, each
 * card's vertical offset and rotation are recomputed from its distance to
 * the viewport centre: the centre card sits highest and flat, edge cards sit
 * lower and rotate outward up to 12deg. Dragging (mouse or touch) moves the
 * row with velocity tracked per pointer event; after release the velocity
 * decays smoothly into inertia. The mouse wheel scrolls the row while the
 * pointer is over it. The row loops infinitely — cards that leave one side
 * re-enter on the other. Prev/next buttons and the arrow keys (when the
 * gallery is focused) step one garment at a time.
 *
 * Under prefers-reduced-motion the arc, rotation and inertia are removed;
 * dragging and stepping still work, instantly and flat.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image, { type StaticImageData } from "next/image";
import gsap from "gsap";
import { useReducedMotion } from "motion/react";

import { SectionShell } from "@/components/sections/SectionShell";
import { getFabric } from "@/lib/data";

interface Garment {
  readonly caption: string;
  readonly image: StaticImageData;
  readonly alt: string;
}

/** The photo of a swatch-book cloth, by id. */
function cloth(id: string): StaticImageData {
  const fabric = getFabric(id);
  if (fabric === undefined) throw new Error(`Unknown fabric: ${id}`);
  return fabric.image;
}

// TODO(client): these cards show the cloth each garment was cut from. Swap in
// photos of the finished garments (with the customers' permission) when the
// shoot in docs/PHOTO_SHOT_LIST.md is done.
const GARMENTS: readonly Garment[] = [
  {
    caption: "Wedding sherwani in Bottle green velvet",
    image: cloth("bottle-green-velvet"),
    alt: "Bottle green velvet, folded — the cloth this garment is cut from",
  },
  {
    caption: "Office shirt in Bengal stripe",
    image: cloth("bengal-stripe"),
    alt: "Bengal stripe, folded — the cloth this garment is cut from",
  },
  {
    caption: "Three-piece suit in Charcoal herringbone",
    image: cloth("charcoal-herringbone"),
    alt: "Charcoal herringbone, folded — the cloth this garment is cut from",
  },
  {
    caption: "Summer kurta in Ivory linen",
    image: cloth("ivory-linen"),
    alt: "Ivory linen, folded — the cloth this garment is cut from",
  },
  {
    caption: "First boardroom suit in Navy twill",
    image: cloth("navy-twill"),
    alt: "Navy twill, folded — the cloth this garment is cut from",
  },
  {
    caption: "Sangeet shirt in Sky end-on-end",
    image: cloth("sky-end-on-end"),
    alt: "Sky end-on-end, folded — the cloth this garment is cut from",
  },
  {
    caption: "Weekend trousers in Sandstone chino",
    image: cloth("sandstone-chino"),
    alt: "Sandstone chino, folded — the cloth this garment is cut from",
  },
  {
    caption: "Reception bandhgala in Charcoal herringbone",
    image: cloth("charcoal-herringbone"),
    alt: "Charcoal herringbone, folded — the cloth this garment is cut from",
  },
  {
    caption: "Anniversary dinner shirt in Oxford white",
    image: cloth("oxford-white"),
    alt: "Oxford white, folded — the cloth this garment is cut from",
  },
  {
    caption: "Diwali jacket in Navy twill",
    image: cloth("navy-twill"),
    alt: "Navy twill, folded — the cloth this garment is cut from",
  },
];

const CARD_W = 300;
const CARD_GAP = 28;
const SPACING = CARD_W + CARD_GAP;
const TOTAL = GARMENTS.length * SPACING;
/** Edge cards drop this far below the centre card. */
const ARC_DROP = 44;
/** Maximum outward rotation at the edges, in degrees. */
const ARC_TILT = 12;
/** Frame time used to turn px/ms velocity into px/frame. */
const FRAME_MS = 16.7;
/** Velocity multiplier per frame once the pointer lets go. */
const FRICTION = 0.94;
/** Velocities smaller than this, in px/ms, are treated as stopped. */
const MIN_VELOCITY = 0.02;

interface GalleryState {
  scrollX: number;
  velocity: number;
  dragging: boolean;
  lastX: number;
  lastT: number;
  dirty: boolean;
}

export function MadeGallery() {
  const prefersReducedMotion = useReducedMotion();
  const reduced = prefersReducedMotion === true;

  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stateRef = useRef<GalleryState>({
    scrollX: 0,
    velocity: 0,
    dragging: false,
    lastX: 0,
    lastT: 0,
    dirty: true,
  });
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const reducedRef = useRef(reduced);

  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  /**
   * Position every card from the current scroll offset. Each card's raw x
   * is wrapped into (-TOTAL/2, TOTAL/2] so the row loops forever, then the
   * arc offset and rotation come from its distance to the viewport centre.
   */
  const layout = useCallback(() => {
    const track = trackRef.current;
    if (track === null) return;
    const state = stateRef.current;
    const vw = track.clientWidth;
    const reach = vw * 0.5 + CARD_W;

    GARMENTS.forEach((_, index) => {
      const card = cardRefs.current[index];
      if (card === undefined || card === null) return;

      let x = index * SPACING - state.scrollX;
      x = ((x % TOTAL) + TOTAL) % TOTAL;
      if (x > TOTAL / 2) x -= TOTAL;

      const t = Math.min(1, Math.abs(x) / reach);
      const curve = t * t;
      const y = reducedRef.current ? 0 : curve * ARC_DROP;
      const rotate = reducedRef.current ? 0 : Math.sign(x) * curve * ARC_TILT;

      card.style.transform = `translate3d(calc(-50% + ${x.toFixed(2)}px), ${y.toFixed(2)}px, 0) rotate(${rotate.toFixed(2)}deg)`;
    });
  }, []);

  const stopTween = useCallback(() => {
    tweenRef.current?.kill();
    tweenRef.current = null;
  }, []);

  /** Step one garment over, eased — instant under reduced motion. */
  const step = useCallback(
    (direction: 1 | -1) => {
      const state = stateRef.current;
      state.velocity = 0;
      stopTween();
      if (reducedRef.current) {
        state.scrollX += direction * SPACING;
        state.dirty = true;
        return;
      }
      const proxy = { x: state.scrollX };
      tweenRef.current = gsap.to(proxy, {
        x: state.scrollX + direction * SPACING,
        duration: 0.6,
        ease: "power3.out",
        overwrite: true,
        onUpdate() {
          state.scrollX = proxy.x;
          state.dirty = true;
        },
      });
    },
    [stopTween],
  );

  // Physics loop: inertia decays, then cards are laid out when anything moved.
  useEffect(() => {
    let frame = 0;
    const loop = () => {
      const state = stateRef.current;
      if (!state.dragging && Math.abs(state.velocity) > MIN_VELOCITY) {
        state.scrollX -= state.velocity * FRAME_MS;
        state.velocity *= FRICTION;
        state.dirty = true;
      } else if (!state.dragging && state.velocity !== 0) {
        state.velocity = 0;
      }
      if (state.dirty) {
        layout();
        state.dirty = false;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [layout]);

  // Wheel over the gallery scrolls the row instead of the page.
  useEffect(() => {
    const track = trackRef.current;
    if (track === null) return;
    const onWheel = (event: WheelEvent) => {
      // Only capture wheel when horizontal scrolling intent is present (trackpad horizontal swipe or shiftKey)
      // Never trap normal vertical page scrolling.
      const isHorizontalIntent =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey;
      if (!isHorizontalIntent) return;

      event.preventDefault();
      event.stopPropagation();
      const state = stateRef.current;
      stopTween();
      state.velocity = 0;
      const delta = event.deltaX !== 0 ? event.deltaX : event.deltaY;
      state.scrollX += delta;
      state.dirty = true;
    };
    track.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => track.removeEventListener("wheel", onWheel, { capture: true });
  }, [stopTween]);

  // First layout before paint so the cards never flash stacked at centre.
  useLayoutEffect(() => {
    stateRef.current.dirty = true;
    layout();
  }, [layout]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const state = stateRef.current;
    stopTween();
    state.dragging = true;
    state.velocity = 0;
    state.lastX = event.clientX;
    state.lastT = event.timeStamp;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  // The handler only advances the offset and records velocity; the rAF physics
  // loop is the single place cards are measured and written.
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = stateRef.current;
    if (!state.dragging) return;
    const dx = event.clientX - state.lastX;
    const dt = Math.max(1, event.timeStamp - state.lastT);
    state.scrollX -= dx;
    state.velocity = 0.8 * (dx / dt) + 0.2 * state.velocity;
    state.lastX = event.clientX;
    state.lastT = event.timeStamp;
    state.dirty = true;
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = stateRef.current;
    if (!state.dragging) return;
    state.dragging = false;
    if (reducedRef.current) state.velocity = 0;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
  };

  return (
    <SectionShell
      id="made"
      heading="What he made of it"
      intro="Every length is cut with a garment in mind. Here is the cloth, and what it becomes."
      contentClassName="relative left-1/2 w-screen max-w-full -translate-x-1/2 overflow-hidden"
    >
      <div
        ref={trackRef}
        role="group"
        aria-roledescription="carousel"
        aria-label="Garments stitched from Kushagra fabric lengths. Focus and use the arrow keys, or drag, to browse."
        tabIndex={0}
        data-lenis-prevent
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        className="relative h-[560px] w-full cursor-grab touch-pan-y overflow-hidden select-none active:cursor-grabbing"
      >
        {GARMENTS.map((garment, index) => (
          <div
            key={garment.caption}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className="absolute top-10 left-1/2 w-[300px] will-change-transform"
          >
            <Image
              src={garment.image}
              alt={garment.alt}
              sizes="300px"
              placeholder="blur"
              draggable={false}
              className="h-[400px] w-[300px] rounded-m border border-line bg-paper object-cover"
            />
            <p className="mt-3 text-center text-[0.9375rem] text-chalk">
              {garment.caption}
            </p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-2 flex w-full max-w-[1320px] gap-3 px-[clamp(20px,5vw,64px)]">
        <button
          type="button"
          aria-label="Previous garment"
          onClick={() => step(-1)}
          className="inline-flex h-12 w-12 items-center justify-center rounded-pill border border-line bg-paper text-suiting transition-colors duration-300 hover:border-suiting"
        >
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Next garment"
          onClick={() => step(1)}
          className="inline-flex h-12 w-12 items-center justify-center rounded-pill border border-line bg-paper text-suiting transition-colors duration-300 hover:border-suiting"
        >
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </SectionShell>
  );
}
