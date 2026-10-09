/**
 * Design tokens, mirrored from src/app/globals.css @theme block.
 * JS animation code (GSAP / motion) must read values from here,
 * never hard-code hex values or easings.
 */
export const tokens = {
  color: {
    shirting: "#EEF1F4",
    paper: "#F7F8FA",
    suiting: "#1B2433",
    red: "#E63339",
    thread: "#F28C3C",
    chalk: "#5E6773",
    line: "rgb(27 36 51 / 0.14)",
  },
  ease: {
    /** CSS cubic-bezier, for motion / CSS transitions. */
    tailor: "cubic-bezier(0.22, 1, 0.36, 1)",
    /** GSAP CustomEase name registered once in SmoothScroll. */
    tailorGsap: "tailor",
  },
  radius: {
    s: "6px",
    m: "14px",
    pill: "999px",
  },
  layout: {
    /** Fixed nav bar offset used by SmoothScroll.scrollTo. */
    navOffset: 96,
    shellMax: 1320,
  },
} as const;

export type Tokens = typeof tokens;
export type TokenColor = keyof Tokens["color"];
