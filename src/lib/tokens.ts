/**
 * Mirrors the CSS custom properties declared in src/app/globals.css.
 *
 * Tailwind classes (bg-shirting, text-chalk, ease-tailor …) come from the
 * @theme block in CSS. This module exists for the JS animation code — GSAP,
 * motion and canvas — which needs real values rather than var() references.
 *
 * If a value changes here, change it in globals.css too.
 */

export const color = {
  shirting: "#eef1f4",
  paper: "#f7f8fa",
  suiting: "#1b2433",
  red: "#e63339",
  redDeep: "#c92b31",
  redSoft: "#ffa0a3",
  thread: "#f28c3c",
  chalk: "#5e6773",
  line: "rgb(27 36 51 / 0.14)",
} as const;

/** cubic-bezier(0.22, 1, 0.36, 1) — the house easing. */
export const easeTailor = "cubic-bezier(0.22, 1, 0.36, 1)" as const;

/** Same curve as a control-point tuple, for motion and GSAP bezier eases. */
export const easeTailorPoints = [0.22, 1, 0.36, 1] as const;

/** Mutable tuple form, for motion's `ease` prop which wants a 4-number bezier. */
export const easeTailorBezier: [number, number, number, number] = [
  0.22, 1, 0.36, 1,
];

/** SVG path form of the curve, for `CustomEase.create("tailor", …)`. */
export const easeTailorPath = "M0,0 C0.22,1 0.36,1 1,1" as const;

/** Registered GSAP ease name. Created once in SmoothScroll. */
export const gsapEaseName = "tailor" as const;

export const radius = {
  s: 6,
  m: 14,
  pill: 999,
} as const;

export const layout = {
  /** Max width of the 12-column shell, in px. */
  shellMaxWidth: 1320,
  /** Side padding: clamp(20px, 5vw, 64px). */
  gutter: "clamp(20px, 5vw, 64px)",
  /** Section padding: clamp(72px, 9vw, 128px). */
  sectionPad: "clamp(72px, 9vw, 128px)",
  /** Distance from the viewport top to the floating nav bar, in px. */
  navTop: 20,
  /** Nav bar height at rest / after scrolling past the compact threshold. */
  navHeight: 72,
  navHeightCompact: 56,
  /** Scroll distance after which the nav compacts, in px. */
  navCompactAt: 120,
  /** Extra breathing room applied on top of the nav height when scrolling to an anchor. */
  navScrollPadding: 16,
  /** Below this width the mobile menu takes over from the pill bar. */
  mobileBreakpoint: 900,
} as const;

export const duration = {
  /** Preloader: stitch draw. */
  stitch: 1.1,
  /** Preloader: logo reveal. */
  logo: 0.5,
  /** Preloader: curtain lift. */
  curtain: 0.8,
  /** Nav compact / hide / show. */
  nav: 0.45,
  /** Pill sliding between nav links. */
  pill: 0.42,
  /** Mobile menu panels and links. */
  menu: 0.6,
  /** Bag badge bump. */
  bump: 0.45,
} as const;

export const tokens = {
  color,
  easeTailor,
  easeTailorPoints,
  easeTailorBezier,
  easeTailorPath,
  gsapEaseName,
  radius,
  layout,
  duration,
} as const;

export type Tokens = typeof tokens;
export type ColorToken = keyof typeof color;
