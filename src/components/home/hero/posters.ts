import type { StaticImageData } from "next/image";

import closedDesktop from "@/assets/hero/hero-closed-desktop.webp";
import closedMobile from "@/assets/hero/hero-closed-mobile.webp";
import openDesktop from "@/assets/hero/hero-open-desktop.webp";
import openMobile from "@/assets/hero/hero-open-mobile.webp";

/**
 * Poster stills of the hero scene, rendered from the scene itself so they
 * match the live canvas exactly.
 *
 * The closed poster is the hero's first paint (and LCP image) while three.js
 * loads after it; the open poster is the whole hero for visitors who prefer
 * reduced motion, have no WebGL, or are on a low-memory device.
 *
 * Positions are fractions of the render frame. The desktop frame is rendered
 * unshifted at 16:10 and placed by CSS so that, like the live camera, its
 * size follows the stage height and its centre sits at (0.5 + shift) of the
 * stage width. The mobile frame is square and fills the square visual.
 *
 * To re-render after changing the scene: open /hero-lab?poster=1&p=0 (and
 * p=1, and each with &layout=mobile) at the frame size below and scale,
 * capture the [data-poster-frame] element on a transparent background, crop
 * desktop to the drawn pixels, encode WebP, and update `crop` and `anchors`
 * (the frame's data-anchors attribute at p=1, divided by the frame size).
 */

export const POSTER_FRAME = {
  desktop: { width: 1440, height: 900, scale: 2 },
  mobile: { width: 800, height: 800, scale: 1.5 },
} as const;

export interface Crop {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface Poster {
  readonly image: StaticImageData;
  readonly crop: Crop;
}

export const POSTERS = {
  desktop: {
    closed: { image: closedDesktop, crop: { x: 0.2681, y: 0.3094, w: 0.4927, h: 0.4244 } },
    open: { image: openDesktop, crop: { x: 0.1792, y: 0, w: 0.6542, h: 0.9089 } },
  },
  mobile: {
    closed: { image: closedMobile, crop: { x: 0, y: 0, w: 1, h: 1 } },
    open: { image: openMobile, crop: { x: 0, y: 0, w: 1, h: 1 } },
  },
} as const satisfies Record<"desktop" | "mobile", Record<"closed" | "open", Poster>>;

/** Where each cloth's name tag pins at the end of the film, frame fractions. */
export const TAG_ANCHORS = {
  desktop: [
    { x: 0.4549, y: 0.4349 },
    { x: 0.4222, y: 0.5154 },
    { x: 0.3877, y: 0.6002 },
  ],
  mobile: [
    { x: 0.444, y: 0.4369 },
    { x: 0.4044, y: 0.4996 },
    { x: 0.3634, y: 0.5646 },
  ],
} as const;
