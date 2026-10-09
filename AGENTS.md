# Kushagra — agent handbook

Premium production website for Kushagra™: unstitched shirting and suiting
fabric, gift-boxed for men. Tagline: **Select • Stitch • Stand Out**.
Phase 1 of 7 (foundation, chrome and section skeleton).

## Stack (exact)

- next@15 (App Router, `src/` dir), react@19, typescript strict with
  `noUncheckedIndexedAccess`. No `any`, no `as unknown as`, no `console.log`.
- tailwindcss@4 via `@tailwindcss/postcss`. Tokens live as CSS variables in
  `src/app/globals.css` under `@theme`, so classes like `bg-shirting`,
  `text-suiting`, `rounded-pill`, `ease-tailor` exist.
- motion (`import from "motion/react"`), gsap@3.13 + ScrollTrigger,
  `@gsap/react` (useGSAP), lenis, zustand, clsx.
- React Bits components installed into `src/components/reactbits/`
  (TS + Tailwind variants) and restyled to our tokens.
- Fonts: Bodoni Moda (display, 400–900 + italic) and Cabin (body, 400–700),
  `display: "swap"`. `fonts.googleapis.com` is unreachable from this build
  environment, so the variable TTFs are vendored from the official
  `google/fonts` GitHub repository into `src/fonts/` and loaded with
  `next/font/local` under the same contract: `--font-display` /
  `--font-body` theme variables (see `src/app/layout.tsx`). OFL licences
  are kept next to the fonts.

## Design tokens

Defined once in `src/app/globals.css` `@theme` and mirrored as a typed const
in `src/lib/tokens.ts` for JS animation code. Never hard-code a hex value
or an easing curve in a component.

| Token          | Value                 | Use                                            |
| -------------- | --------------------- | ---------------------------------------------- |
| shirting       | `#EEF1F4`             | page background                                |
| paper          | `#F7F8FA`             | raised surfaces                                |
| suiting        | `#1B2433`             | main text, dark sections                       |
| red            | `#E63339`             | logo, ribbon, the single primary button, errors |
| thread         | `#F28C3C`             | dashed stitch lines and sparks only, never text |
| chalk          | `#5E6773`             | secondary text (AA on shirting at 17px)        |
| line           | `rgb(27 36 51 / .14)` | hairlines and borders                          |
| ease-tailor    | `cubic-bezier(.22,1,.36,1)` | every intentional movement              |
| radius s/m/pill| 6 / 14 / 999 px       | corners                                        |

Red stays rare. No decorative gradients. No drop shadows by default.

## Typography

- Display: Bodoni Moda 400, tracking -0.02em, line-height 1.02.
  h1 `clamp(3rem, 8vw, 7.5rem)`, h2 `clamp(2.25rem, 5vw, 4.5rem)`, h3 1.75rem.
- Body/UI: Cabin 17px, line-height 1.6, paragraphs max 62ch, numbers
  tabular-nums (`.tnum`).
- Sentence case everywhere. No all-caps eyebrows, no single italic word in a
  heading, no arrows on buttons, no emoji.

## Layout

- 12-column grid (`shell`, `grid-12`, `section-pad` utilities): max-width
  1320px, side padding `clamp(20px, 5vw, 64px)`, section padding
  `clamp(96px, 14vw, 180px)`.
- Content sits left and slightly off-centre (columns start at 2), like
  folded cloth in a box. No centred symmetric layouts except the footer
  wordmark.

## Animation ownership (obey in every phase)

- **GSAP + ScrollTrigger** owns anything tied to scroll position
  (hero unboxing, stitch line, footer stitch).
- **motion/react** owns mount/unmount, gestures, layout and shared elements
  (drawer, menus, builder fly-in, bag badge).
- **React Bits components** own exactly the one location they are assigned
  to in the table below. One component, one place.
- **Lenis** owns scrolling. It is the only smooth-scroll source
  (`src/components/providers/SmoothScroll.tsx`, lerp 0.1, synced with
  ScrollTrigger via `lenis.on("scroll", ScrollTrigger.update)` and
  `gsap.ticker`). Disabled under reduced motion.
- Animate **transform and opacity only**.
- `prefers-reduced-motion`: every effect has a static fallback —
  `<MotionConfig reducedMotion="user">` plus a reduced-motion check for
  GSAP and Lenis (`usePrefersReducedMotion` in SmoothScroll, matchMedia
  checks in Preloader and StaggeredMenu).

## React Bits assignment table

| Component       | Source (TS-TW)                    | Assigned location (only)                        |
| --------------- | --------------------------------- | ----------------------------------------------- |
| PillNav         | reactbits.dev/r/PillNav-TS-TW     | centre link cluster of `chrome/Nav.tsx`         |
| StaggeredMenu   | reactbits.dev/r/StaggeredMenu-TS-TW | overlay of `chrome/MobileMenu.tsx` (< 900px)  |

Registry note: `reactbits.dev` was unreachable from the build sandbox, so
the TS-TW sources were vendored from the official `DavidHDev/react-bits`
GitHub repository into `src/components/reactbits/` and restyled to our
tokens (no React Bits default colours remain). Add new rows here as later
phases install more components.

## Forbidden

- `any`, `as unknown as`, `console.log`.
- Hard-coded colours/easings outside `globals.css` / `tokens.ts`.
- Second smooth-scroll source (no `scroll-behavior: smooth`, no native
  smooth scrolling alongside Lenis).
- React Bits component used in a second location.
- Red as a general accent; decorative gradients; default drop shadows.
- All-caps eyebrow labels; arrows appended to button text; emoji.
- Centred symmetric section layouts (footer wordmark is the exception).
- Committing `node_modules`, `.next`, or scratch folders.
