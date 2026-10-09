# AGENTS.md — Kushagra

Kushagra sells premium unstitched shirting and suiting fabric as **gift boxes for men**.
The giver picks the cloth, he gets it stitched by his own tailor, and he stands out.

> **Select • Stitch • Stand Out**

Buyers are the *givers*: sisters on Raksha Bandhan, families at weddings and Diwali,
wives on anniversaries, HR teams doing corporate gifting. Copy is written to them.

This file is the contract for every phase. Read it before writing a component.

---

## 1. Stack (exact — do not substitute)

| Concern      | Choice                                                        |
| ------------ | ------------------------------------------------------------- |
| Framework    | `next@15` — App Router, `src/` directory                      |
| React        | `react@19`                                                    |
| Language     | TypeScript `strict: true`, `noUncheckedIndexedAccess: true`   |
| Styling      | `tailwindcss@4` + `@tailwindcss/postcss`, tokens in `@theme`  |
| Animation    | `motion/react`, `gsap@3.13` + ScrollTrigger, `@gsap/react`    |
| Scrolling    | `lenis` — the only smooth-scroll source                       |
| State        | `zustand` (bag persisted)                                     |
| Class names  | `clsx` via `src/lib/cn.ts`                                    |
| Fonts        | `next/font/google` — Bodoni Moda (display), Cabin (body)      |

Commands: `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`.

Hard rules enforced by ESLint (`no-console: error`, `no-explicit-any: error`):

- **No `any`.** No `as unknown as`. Type the thing instead.
- **No `console.log`** anywhere. Not even temporarily.
- Indexing an array yields `T | undefined` — narrow it, never `!`.

---

## 2. Design tokens

Defined once in `src/app/globals.css` under `@theme`, and mirrored as a typed const in
`src/lib/tokens.ts` for JS animation code. **Change both together.**

| Token              | Value                    | Use                                                    |
| ------------------ | ------------------------ | ------------------------------------------------------ |
| `--color-shirting` | `#EEF1F4`                | page background                                        |
| `--color-paper`    | `#F7F8FA`                | raised surfaces (nav bar, cards)                       |
| `--color-suiting`  | `#1B2433`                | main text, dark sections, nav pill fill                |
| `--color-red`      | `#E63339`                | **only**: logo, ribbon, the one primary button, errors |
| `--color-thread`   | `#F28C3C`                | **only**: dashed stitch lines and sparks. Never text   |
| `--color-chalk`    | `#5E6773`                | secondary text (AA on shirting at 17px)                |
| `--color-line`     | `rgb(27 36 51 / 0.14)`   | 1px borders and rules                                  |
| `--ease-tailor`    | `cubic-bezier(.22,1,.36,1)` | the house easing — `ease-tailor`                   |
| `--radius-s`       | `6px`                    | small elements                                         |
| `--radius-m`       | `14px`                   | cards and panels                                       |
| `--radius-pill`    | `999px`                  | buttons, nav bar, tags                                 |

Tailwind classes: `bg-shirting`, `text-suiting`, `border-line`, `ease-tailor`,
`rounded-pill`, and so on. `rounded-m` and `rounded-pill` are safe; **`rounded-s` needs
the unlayered override at the bottom of `globals.css`** because Tailwind ships its own
bare `rounded-s` (logical start radius). Do not remove that rule.

- **Red stays rare.** One primary action per view. Never a decorative accent.
- **No gradients.** No drop shadows by default. Depth comes from `--color-line` borders
  and the shirting/paper surface pair.

---

## 3. Typography

- Display: **Bodoni Moda 400**, `letter-spacing: -0.02em`, `line-height: 1.02`.
  `h1` `clamp(3rem, 8vw, 7.5rem)` · `h2` `clamp(2.25rem, 5vw, 4.5rem)` · `h3` `1.75rem`.
- Body/UI: **Cabin 17px**, `line-height: 1.6`, paragraphs `max-width: 62ch`.
- Numbers: `tabular-nums` (add `data-numeric` or the `tabular-nums` class).
- Sentence case everywhere.
- **No** all-caps eyebrow labels above headings.
- **No** single italic word inside a heading.
- **No** arrows or glyphs appended to button labels. No emoji.

---

## 4. Layout

- 12-column shell: `.grid-shell` — `max-width: 1320px`,
  `padding-inline: clamp(20px, 5vw, 64px)`, `column-gap: clamp(16px, 2vw, 28px)`.
- `.section-pad` — `padding-block: clamp(96px, 14vw, 180px)`.
- Content sits **left and slightly off-centre** — like folded cloth in a box. Headings
  take columns 1–7 (`lg:col-span-7`), content spans 12. The **only** centred symmetric
  layout on the site is the footer wordmark.
- Below 900px the grid collapses to a single column.

---

## 5. Animation ownership

These boundaries are not suggestions. If an effect needs a library it does not own, the
component is in the wrong place.

| Owner                 | Owns                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------- |
| **GSAP + ScrollTrigger** | Anything tied to scroll position: hero unboxing, the stitch line drawing, footer stitch. |
| **motion/react**      | Mount/unmount, gestures, layout and shared-element: drawer, menus, builder fly-in, bag badge. |
| **React Bits**        | Exactly the one location it is assigned to. One component, one place.                     |
| **Lenis**             | Scrolling. It is the only smooth-scroll source.                                          |

Rules:

- Animate **transform and opacity only**.
  One documented exception: the nav bar's compact state is a CSS `transition` on
  `height`/`padding` — a single fixed element, on a threshold cross, never per frame.
- `prefers-reduced-motion`: **every** effect has a static end state.
  `<MotionConfig reducedMotion="user">` covers motion; GSAP and Lenis are guarded
  explicitly with `useReducedMotion()` (in `SmoothScroll`, which never constructs Lenis
  and never registers the ticker under reduced motion).
- Lenis ↔ GSAP wiring lives in `src/components/providers/SmoothScroll.tsx` only:
  `lenis.on("scroll", ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t * 1000))`,
  `gsap.ticker.lagSmoothing(0)`, plus `ScrollTrigger.refresh()` after `document.fonts.ready`.
- Never call `window.scrollTo` for a smooth animation while Lenis is running — use the
  `scrollTo` from `useSmoothScroll()` so anchors land below the floating nav bar.
- Scroll locking is `stop()` / `start()` from `useSmoothScroll()` (Lenis + a
  `data-scroll-locked` fallback for reduced motion). Never `overflow: hidden` by hand.

### React Bits assignment table

Components live in `src/components/reactbits/` as TS + Tailwind variants, restyled to
our tokens — React Bits' default colours must never survive contact with this codebase.

| Component        | Location                                        | Phase | Status |
| ---------------- | ----------------------------------------------- | ----- | ------ |
| `PillNav`        | `chrome/Nav.tsx` — floating bar, ≥ 900px        | 1     | ✅     |
| `StaggeredMenu`  | `chrome/MobileMenu.tsx` — under 900px           | 1     | ✅     |

Install with
`npx shadcn@latest add https://reactbits.dev/r/<Name>-TS-TW`
— if the registry is unreachable, port the TS-TW source into the same folder by hand
(both current components are hand-ported). Either way, add a row here before using it,
and restyle before committing.

---

## 6. Data and money

- `src/lib/data.ts` types the catalogue: `Occasion`, `Fabric` (`kind: 'shirting' | 'suiting'`),
  `BoxTier` with slot rules. Later phases add contents to boxes, not new shapes.
- **Prices are integer rupees.** Never floats, never paise.
- Format with `formatINR()` from `src/lib/format.ts`. Never concatenate a `₹` by hand.
- `src/store/gift.ts` holds the draft gift (occasion, box, fabrics, note) and the bag.
  Only `lines` is persisted, through `zustand/middleware` `persist` with `skipHydration`
  so the first client render matches the server. `Providers` calls `rehydrate()`.
  Storage access is wrapped so SSR and Safari private mode never throw.

---

## 7. Forbidden list

- `any`, `as unknown as`, non-null `!` assertions, `@ts-ignore`.
- `console.*` of any kind.
- `next/image` with `unoptimized` or `dangerouslyAllowSVG` to dodge an asset problem —
  rasterise the asset instead.
- A second smooth-scroll library, or `scroll-behavior: smooth` doing Lenis' job.
- `useEffect` + `gsap.to` for something that is really a scroll trigger.
- `motion` for scroll-linked animation; GSAP for mount/unmount.
- Gradients, drop shadows, blur-on-text, glassmorphism beyond the nav's `backdrop-blur`.
- Red on anything that is not the logo, a ribbon, the single primary button, or an error.
- `--color-thread` as a text colour.
- All-caps eyebrows, italic words inside headings, arrows in button labels, emoji.
- Centred symmetric section layouts.
- Importing from `reactbits.dev` at runtime; components are vendored.

---

## 8. Brand assets

- `public/brand/kushagra-logo.svg` / `.png` — lockup: red **K** whose stem carries a
  dashed orange stitch line, `KUSHAGRA` wordmark below.
- `public/brand/kushagra-mark.svg` / `.png` — the K alone, used in the nav at 36px tall.
- Both are generated (see the vector source in the SVGs); the PNGs are rasterised from
  them, so regenerate both if the mark changes.

---

## 9. Accessibility baseline

- One focus ring: `2px solid` suiting, `3px` offset, on `:focus-visible`.
- Skip link to `#main` is the first focusable element in the document.
- Menus are `role="dialog" aria-modal="true"`, trap focus, close on Escape, and restore
  focus to their trigger.
- Every section is a `<section>` with `aria-labelledby` pointing at its heading.
- Icon-only buttons carry an `aria-label` that says what they do and how many.
