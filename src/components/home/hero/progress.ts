/**
 * The one number the hero scene renders from: 0 (ribboned, closed) → 1 (open,
 * cloth revealed). GSAP's ScrollTrigger writes it; the R3F scene reads it in
 * useFrame and asks for a new frame whenever it changes. Nothing else moves
 * the scene, so the canvas renders only while the visitor scrolls.
 */

type Listener = (value: number) => void;

export interface HeroProgress {
  get: () => number;
  set: (value: number) => void;
  subscribe: (listener: Listener) => () => void;
}

export function createHeroProgress(initial = 0): HeroProgress {
  let value = initial;
  const listeners = new Set<Listener>();

  return {
    get: () => value,
    set: (next) => {
      const clamped = Math.min(1, Math.max(0, next));
      if (clamped === value) return;
      value = clamped;
      for (const listener of listeners) listener(value);
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
