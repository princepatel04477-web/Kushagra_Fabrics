/**
 * The CSS-drawn fabric swatch: a 320×420 card with the cloth's texture, a
 * paper label (name + composition) sewn on at the bottom, and a pinked
 * zigzag bottom edge cut with clip-path. No images — every cloth is drawn
 * with gradients, the way a swatch is printed.
 *
 * Used by the swatch book pile and, scaled up, by the weave lens.
 */

import type { CSSProperties } from "react";

import type { Fabric, FabricTextureId } from "@/lib/data";
import { cn } from "@/lib/cn";

/**
 * The swatch's canonical size. The Tailwind classes below mirror these
 * numbers (arbitrary values must be literal for the compiler to see them);
 * the weave lens uses the constants for its magnifier maths.
 */
export const SWATCH_WIDTH = 320;
export const SWATCH_HEIGHT = 420;

/** Depth of the pinked teeth, px. */
const PINK_DEPTH = 10;
/** Number of teeth along the bottom edge. */
const PINK_TEETH = 20;

interface TextureStyle {
  readonly backgroundColor: string;
  readonly backgroundImage: string;
  readonly backgroundSize?: string;
}

/**
 * One entry per FabricTextureId. These gradients are the sanctioned exception
 * to the no-gradient rule: they are the cloth itself, not decoration.
 */
const TEXTURES: Record<FabricTextureId, TextureStyle> = {
  // Oxford white: a fine basket cross-hatch on chalk.
  oxford: {
    backgroundColor: "#f3f1ea",
    backgroundImage:
      "repeating-linear-gradient(0deg, rgba(27, 36, 51, 0.05) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(27, 36, 51, 0.08) 0 1px, transparent 1px 3px)",
  },
  // Bengal stripe: a wide indigo stripe with a thinner companion, on cream.
  stripe: {
    backgroundColor: "#f4f1e8",
    backgroundImage:
      "repeating-linear-gradient(90deg, rgba(63, 84, 120, 0.55) 0 4px, transparent 4px 10px, rgba(63, 84, 120, 0.25) 10px 12px, transparent 12px 32px)",
  },
  // Sky end-on-end: hairline warp stripes two pixels apart.
  endonend: {
    backgroundColor: "#edf3f8",
    backgroundImage:
      "repeating-linear-gradient(90deg, rgba(96, 130, 168, 0.5) 0 1px, transparent 1px 4px)",
  },
  // Ivory linen: a fine slubbed cross-hatch.
  linen: {
    backgroundColor: "#ece5d3",
    backgroundImage:
      "repeating-linear-gradient(0deg, rgba(27, 36, 51, 0.07) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(27, 36, 51, 0.05) 0 1px, transparent 1px 3px)",
  },
  // Navy twill: a clean 45° twill line.
  twill: {
    backgroundColor: "#243044",
    backgroundImage:
      "repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.08) 0 2px, transparent 2px 7px)",
  },
  // Charcoal herringbone: alternating diagonals in a four-gradient weave.
  herringbone: {
    backgroundColor: "#3a4150",
    backgroundImage:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.07) 25%, transparent 25%), linear-gradient(225deg, rgba(255, 255, 255, 0.07) 25%, transparent 25%), linear-gradient(315deg, rgba(0, 0, 0, 0.14) 25%, transparent 25%), linear-gradient(45deg, rgba(0, 0, 0, 0.14) 25%, transparent 25%)",
    backgroundSize: "18px 18px",
  },
  // Bottle green velvet: a soft radial sheen over deep green.
  velvet: {
    backgroundColor: "#20362b",
    backgroundImage:
      "radial-gradient(120% 90% at 30% 15%, rgba(255, 255, 255, 0.16), transparent 55%), radial-gradient(140% 110% at 70% 110%, rgba(0, 0, 0, 0.35), transparent 60%)",
  },
  // Sandstone chino: a fine, steep twill.
  chino: {
    backgroundColor: "#c8ad83",
    backgroundImage:
      "repeating-linear-gradient(63deg, rgba(27, 36, 51, 0.1) 0 1px, transparent 1px 4px)",
  },
};

/** Pinked bottom edge: a zigzag of PINK_TEETH teeth, cut with clip-path. */
function pinkedClipPath(): string {
  const points: string[] = [
    "0% 0%",
    "100% 0%",
    `100% calc(100% - ${PINK_DEPTH}px)`,
  ];
  for (let tooth = PINK_TEETH - 1; tooth >= 0; tooth -= 1) {
    const x = tooth * (100 / PINK_TEETH);
    const y = tooth % 2 === 1 ? "100%" : `calc(100% - ${PINK_DEPTH}px)`;
    points.push(`${x}% ${y}`);
  }
  return `polygon(${points.join(", ")})`;
}

/**
 * The CSS background that draws a fabric's texture. Shared by the swatch card
 * itself, the builder's fabric chips and the folded layers in the preview box.
 */
export function fabricTextureStyle(fabric: Fabric): CSSProperties {
  const texture = TEXTURES[fabric.texture];
  return {
    backgroundColor: texture.backgroundColor,
    backgroundImage: texture.backgroundImage,
    backgroundSize: texture.backgroundSize,
  };
}

export interface FabricTextureProps {
  readonly fabric: Fabric;
  readonly className?: string;
}

export function FabricTexture({ fabric, className }: FabricTextureProps) {
  const clipPath = pinkedClipPath();

  return (
    <div
      role="img"
      aria-label={`${fabric.name} — ${fabric.composition}`}
      className={cn(
        "relative h-[420px] w-[320px] max-w-full select-none overflow-hidden rounded-m bg-paper",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={fabricTextureStyle(fabric)}
      />
      <div
        className="absolute inset-x-0 bottom-0 bg-paper px-5 pb-7 pt-3"
        style={{ clipPath }}
      >
        <div className="stitch-line mb-3" aria-hidden="true" />
        <p className="font-display text-[1.375rem] leading-[1.05] tracking-[-0.02em] text-suiting">
          {fabric.name}
        </p>
        <p className="mt-1 font-body text-[0.9375rem] text-chalk">
          {fabric.composition}
        </p>
      </div>
    </div>
  );
}
