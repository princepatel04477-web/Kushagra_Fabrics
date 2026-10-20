/**
 * The unboxing hero's choreography, as one pure function: scroll progress
 * (0 → 1) in, the pose of every moving part out. The scene, the overlay copy
 * and the step counter all read from here, so there is a single description
 * of the film (docs/HERO_PLAN.md §2).
 *
 * Each beat has its own curve and overlaps its neighbours by a little, so
 * one action hands over to the next instead of queueing behind it. Nothing
 * moves at constant speed.
 *
 *   0.00–0.10  copy steps back, camera eases in
 *   0.07–0.30  the bow comes undone, both bands slip off onto the table
 *   0.28–0.52  the lid lifts (slowly at first — a snug lid), then is set
 *              down leaning behind the box
 *   0.47–0.66  the tissue folds out over the walls, top sheet first
 *   0.60–0.86  the camera tilts down; the three lengths lift and part
 *   0.82–0.92  the note card slides out
 *   0.90–1.00  the cloth names and the closing line set
 */

export interface HeroPose {
  /** 0 → 1: the load copy (h1, sub, CTAs) steps back. */
  readonly copyOut: number;
  /** 0 → 1: the bow's loops and knot pull through. */
  readonly bow: number;
  /** 0 → 1: each band slides off the lid and settles on the table. */
  readonly bandA: number;
  readonly bandB: number;
  /** 0 → 1: the lid rises straight up. */
  readonly lidLift: number;
  /** 0 → 1: the lid is carried back and set down, leaning. */
  readonly lidSet: number;
  /** 0 → 1: each tissue sheet folds open. Right lies on top, so it goes first. */
  readonly tissueRight: number;
  readonly tissueLeft: number;
  /** 0 → 1: camera tilt and the cloths lifting apart. */
  readonly reveal: number;
  /** 0 → 1: camera dolly during the opening beats (before the reveal). */
  readonly approach: number;
  /** 0 → 1: the note card slides out. */
  readonly card: number;
  /** 0 → 1: the callouts and closing copy set. */
  readonly endIn: number;
  /** Index of the current step for the counter (0–3). */
  readonly step: number;
}

export const HERO_STEPS = [
  "Untie the ribbon",
  "Lift the lid",
  "Part the tissue",
  "Meet the cloth",
] as const;

/** Progress at which each step begins, for the counter. */
const STEP_STARTS = [0, 0.28, 0.47, 0.62] as const;

export function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/** Local 0 → 1 progress of the window [start, end]. */
export function segment(progress: number, start: number, end: number): number {
  return clamp01((progress - start) / (end - start));
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

/**
 * A snug lid: it barely moves for the first third while the air seal lets
 * go, then rises freely and eases to a stop.
 */
export function easeSnugLift(t: number): number {
  const hold = 0.32;
  if (t <= hold) return 0.06 * Math.pow(t / hold, 2);
  return 0.06 + 0.94 * easeOutCubic((t - hold) / (1 - hold));
}

export function heroPose(progress: number): HeroPose {
  const p = clamp01(progress);

  let step = 0;
  STEP_STARTS.forEach((start, index) => {
    if (p >= start) step = index;
  });

  return {
    copyOut: easeInOutSine(segment(p, 0, 0.09)),
    bow: easeInOutCubic(segment(p, 0.07, 0.17)),
    bandA: segment(p, 0.13, 0.27),
    bandB: segment(p, 0.16, 0.3),
    lidLift: easeSnugLift(segment(p, 0.28, 0.4)),
    lidSet: easeInOutCubic(segment(p, 0.37, 0.52)),
    tissueRight: segment(p, 0.47, 0.6),
    tissueLeft: segment(p, 0.52, 0.66),
    reveal: easeInOutCubic(segment(p, 0.6, 0.86)),
    approach: easeInOutSine(segment(p, 0, 0.5)),
    card: easeInOutCubic(segment(p, 0.82, 0.92)),
    endIn: easeOutCubic(segment(p, 0.9, 1)),
    step,
  };
}
