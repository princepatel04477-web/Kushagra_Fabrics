"use client";

/**
 * React Bits — FlowingMenu (TS + Tailwind variant), restyled to Kushagra
 * tokens. https://reactbits.dev — hand-ported into src/components/reactbits
 *
 * Assigned to: the occasions list (src/components/occasions/Occasions.tsx).
 * One location.
 *
 * Each row is a full-width button: the occasion name in Bodoni Moda on the
 * left, its line in Cabin on the right, a 1px rule above, 28px of vertical
 * padding. On hover a suiting band slides in from the horizontal edge the
 * cursor crossed (top or bottom, by cursor Y against the row's centre) in
 * 0.5s ease-tailor, and slides back out the way the cursor left. Inside the
 * band a marquee loops the occasion name in shirting, alternating with
 * small rounded photo tiles.
 *
 * motion/react owns the band and the marquee: this is a menu gesture, not a
 * scroll effect. On touch (hover: none) the first tap only reveals the band;
 * the second tap selects. Rows are buttons, so keyboard focus reveals the
 * band and Enter selects.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/cn";
import { easeTailorBezier } from "@/lib/tokens";

export interface FlowingMenuItem {
  readonly id: string;
  /** Display name — also the marquee text. */
  readonly text: string;
  /** One line shown on the right of the row. */
  readonly line: string;
  /** Small photo tiles alternating with the name inside the band. */
  readonly images: readonly string[];
}

export interface FlowingMenuProps {
  readonly items: readonly FlowingMenuItem[];
  /** Currently chosen item, if any — gets aria-pressed and a "Chosen" tag. */
  readonly selectedId?: string | null;
  readonly onSelect?: (id: string) => void;
  readonly className?: string;
}

/** Which edge of the row the cursor is nearer, by Y against the row centre. */
type Edge = "top" | "bottom";

function edgeFor(clientY: number, element: HTMLElement): Edge {
  const rect = element.getBoundingClientRect();
  return clientY < rect.top + rect.height / 2 ? "top" : "bottom";
}

/** Where the band sits while hidden, for a given edge. */
function hiddenY(edge: Edge): string {
  return edge === "top" ? "-101%" : "101%";
}

/** True on devices without a hover pointer (touch-first). */
function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(hover: none)");
    const update = () => setCoarse(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return coarse;
}

/** One half of the marquee — duplicated so the -50% loop is seamless. */
function MarqueeGroup({ text, images }: { readonly text: string; readonly images: readonly string[] }) {
  return (
    <span className="flex items-center gap-6 pr-6">
      <MarqueeText text={text} />
      {images.map((src) => (
        <Image
          key={src}
          src={src}
          alt=""
          width={56}
          height={56}
          loading="lazy"
          decoding="async"
          className="h-14 w-14 rounded-s object-cover"
        />
      ))}
      <MarqueeText text={text} />
    </span>
  );
}

function MarqueeText({ text }: { readonly text: string }) {
  return (
    <span className="whitespace-nowrap font-display text-[clamp(1.5rem,3vw,2.5rem)] leading-none tracking-[-0.02em] text-shirting">
      {text}
    </span>
  );
}

interface FlowingMenuRowProps {
  readonly item: FlowingMenuItem;
  readonly selected: boolean;
  readonly onSelect?: (id: string) => void;
}

function FlowingMenuRow({ item, selected, onSelect }: FlowingMenuRowProps) {
  const [edge, setEdge] = useState<Edge>("top");
  const [open, setOpen] = useState(false);
  const coarse = useCoarsePointer();
  const reduced = useReducedMotion();
  // On touch the first tap only reveals the band; the second tap selects.
  const revealedByTouch = useRef(false);

  const handleSelect = () => {
    if (coarse && !revealedByTouch.current) {
      revealedByTouch.current = true;
      setEdge("top");
      setOpen(true);
      return;
    }
    onSelect?.(item.id);
  };

  return (
    <li>
      <button
        type="button"
        aria-label={`Choose ${item.text}`}
        aria-pressed={selected ? "true" : undefined}
        onMouseEnter={(event) => {
          setEdge(edgeFor(event.clientY, event.currentTarget));
          setOpen(true);
        }}
        onMouseLeave={(event) => {
          setEdge(edgeFor(event.clientY, event.currentTarget));
          setOpen(false);
          revealedByTouch.current = false;
        }}
        onFocus={() => {
          setEdge("top");
          setOpen(true);
        }}
        onBlur={() => {
          setOpen(false);
          revealedByTouch.current = false;
        }}
        onClick={handleSelect}
        className="relative flex w-full flex-wrap items-baseline justify-between gap-x-8 gap-y-2 overflow-hidden border-t border-line py-7 text-left"
      >
        <span className="flex items-baseline gap-4">
          <span className="font-display text-[clamp(2rem,5vw,4rem)] leading-[1.02] tracking-[-0.02em] text-suiting">
            {item.text}
          </span>
          {selected ? (
            <span className="rounded-pill border border-line px-3 py-1 font-body text-[0.8125rem] font-medium text-chalk">
              Chosen
            </span>
          ) : null}
        </span>
        <span className="max-w-[36ch] text-right font-body text-[1rem] text-chalk">
          {item.line}
        </span>

        {/* The suiting band: enters from the edge the cursor crossed, leaves
            the way the cursor left. */}
        <motion.span
          aria-hidden="true"
          initial={{ y: hiddenY(edge) }}
          animate={{ y: open ? "0%" : hiddenY(edge) }}
          transition={{ duration: 0.5, ease: easeTailorBezier }}
          className="absolute inset-0 flex items-center overflow-hidden bg-suiting"
        >
          <motion.span
            className="flex w-max items-center"
            animate={{ x: reduced === true ? "0%" : ["0%", "-50%"] }}
            transition={
              reduced === true
                ? { duration: 0 }
                : { duration: 16, ease: "linear", repeat: Infinity }
            }
          >
            {[0, 1, 2, 3].map((group) => (
              <MarqueeGroup key={group} text={item.text} images={item.images} />
            ))}
          </motion.span>
        </motion.span>
      </button>
    </li>
  );
}

export function FlowingMenu({
  items,
  selectedId,
  onSelect,
  className,
}: FlowingMenuProps) {
  return (
    <ul className={cn("border-b border-line", className)}>
      {items.map((item) => (
        <FlowingMenuRow
          key={item.id}
          item={item}
          selected={item.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}

export default FlowingMenu;
