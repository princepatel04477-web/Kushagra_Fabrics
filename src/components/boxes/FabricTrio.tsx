/**
 * A small stack of fabric photographs standing for what a box holds: two or
 * three square tiles, each overlapping the one before it by 28%, with a 2px
 * paper ring so the edges read. Photographs are never rotated.
 *
 * Illustrative, not a promise of the exact cloths inside — the ids come from
 * BoxTier.preview. Laid out in percentages, so it shrinks with its container
 * instead of overflowing it.
 */

import type { CSSProperties } from "react";
import Image from "next/image";

import { cn } from "@/lib/cn";
import { getFabric, type Fabric } from "@/lib/data";

export interface FabricTrioProps {
  /** Fabric ids to show, in stacking order (the last sits on top). */
  readonly ids: readonly string[];
  /** Side of one square tile at full size, in px. */
  readonly size?: number;
  readonly className?: string;
}

/** How much of each tile the next one covers. */
const OVERLAP = 0.28;
const STEP = 1 - OVERLAP;

export function FabricTrio({ ids, size = 120, className }: FabricTrioProps) {
  const tiles = ids
    .map((id) => getFabric(id))
    .filter((fabric): fabric is Fabric => fabric !== undefined);

  if (tiles.length === 0) return null;

  // Widths in tile units: one tile, plus one step for each further tile.
  const span = 1 + STEP * (tiles.length - 1);
  const tilePercent = 100 / span;

  const style: CSSProperties = {
    width: size * span,
    aspectRatio: `${span} / 1`,
  };

  return (
    <div
      aria-hidden="true"
      className={cn("relative max-w-full shrink-0", className)}
      style={style}
    >
      {tiles.map((fabric, index) => (
        <div
          key={fabric.id}
          className="absolute top-0 h-full overflow-hidden rounded-s bg-paper ring-2 ring-paper"
          style={{
            left: `${tilePercent * STEP * index}%`,
            width: `${tilePercent}%`,
            zIndex: index + 1,
          }}
        >
          <Image
            src={fabric.image}
            alt=""
            fill
            sizes={`${size}px`}
            placeholder="blur"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
