# Kushagra redesign plan — "quiet, image-led, neat"

> **Partly superseded (2026-10-09, same day).** On the owner's request the
> scroll unboxing hero, the stitch-line "How it works", the "What he made of
> it" arc gallery and the `TextPressure` footer wordmark were restored and
> refined, contrary to §3–§5 below. `AGENTS.md` is authoritative; read this
> file as the record of the image and cleanup work, not as current layout.

Author: Opus 5.5 (plan). Executor: Sonnet 5.5. Date: 2026-10-09. Branch: `draft-01`.

Read `AGENTS.md` first. It is still the contract; this plan says exactly where
the contract changes (section 9). When the two disagree, this plan wins and you
update `AGENTS.md` to match (Phase 7).

---

## 1. Why — the client's complaint, made concrete

The client said: *too much on one page, very bad photos, doesn't feel premium,
not neat and clean.* An audit of the running site (1440px and 390px) found:

| Complaint | What is actually on screen |
| --- | --- |
| Bad photos | Every photo is an Unsplash hotlink that does not match its caption: a grey **sweatshirt** captioned "Diwali jacket in Navy twill", a **T-shirt** captioned "Office shirt in Bengal stripe", a blue check three-piece suit captioned "Wedding sherwani in Bottle green velvet". The fabrics page shows **flat beige CSS rectangles** instead of cloth. Box tiers use tiny CSS clip-art boxes. |
| Too much | Home is ~8,700px tall. 13 React Bits effects across the site, a 250%-pinned scroll-jacked unboxing hero (two full screens of an empty left half), a draggable arc gallery with inertia, a diagonal stitch-line section, a giant pressure-sensitive wordmark plus a rotating badge in the footer. Every section is a different trick. |
| Not premium | Premium menswear sites (Loro Piana, Drake's, Sunspel, Charvet) are image-led, show the **cloth up close in raking light**, use one restrained type system and let one strong photograph carry each section. Ours carries effects instead of product. Research: luxury menswear sites lead with full-bleed product/editorial imagery; fabric texture needs side light; Baymard: apparel shoppers need close-up texture shots. |
| Not neat | Huge vertical gaps with nothing in them (section padding up to 180px around sparse content), a builder whose preview card overlaps the step column ("…e the gift" clipped), corporate stats rendering as "-70+ / -1+ / -0+" (CountUp's effect cancels its own rAF when `started` flips), and invented client names/stats presented as fact. |

**Direction:** fewer sections, each with one job and one real-looking photograph
of *our* product; effects cut to a small, deliberate set; tighter rhythm.
Keep the existing palette, fonts, tokens, nav, preloader, bag and builder logic —
the brand system is fine, the content and density are the problem.

---

## 2. Assets already produced (do not regenerate)

All in `src/assets/photos/` (optimised JPEG, import statically so Next gives
width/height and a blur placeholder). Masters are in `assets-src/generated/`
(gitignored). These are **AI-generated art-direction images**: same surface
(#EEF1F4), same hard window light from the left, same 45° angle. They stand in
until the client's real photography arrives (Phase 8 shot list).

| File | Content | Size | Use |
| --- | --- | --- | --- |
| `hero-box.jpg` | Open navy box, white/sky/herringbone lengths, blank card, loose red ribbon | 928×1152 (4:5) | Home hero; corporate page |
| `box-shirt.jpg` | Slim navy box, white + Bengal stripe lengths, lid with red bow | 2200×1228 (16:9) | Home "boxes" band; `/boxes` banner |
| `fabric-oxford.jpg` | Oxford white, folded | 928×1152 | fabric `oxford-white` |
| `fabric-stripe.jpg` | Bengal stripe | 928×1152 | fabric with texture `stripe` |
| `fabric-endonend.jpg` | Sky end-on-end | 928×1152 | texture `endonend` |
| `fabric-linen.jpg` | Ivory linen | 928×1152 | texture `linen` |
| `fabric-twill.jpg` | Navy twill | 928×1152 | texture `twill` |
| `fabric-herringbone.jpg` | Charcoal herringbone | 928×1152 | texture `herringbone`; `/about` |
| `fabric-velvet.jpg` | Bottle green velvet | 928×1152 | texture `velvet` |
| `fabric-chino.jpg` | Sandstone chino | 928×1152 | texture `chino` |

Also: `public/og.jpg` (1200×630, from `box-shirt`) — use it for Open Graph.

There is **no** photo of a tailor, a man wearing the cloth, the wooden trunk, or
corporate stacks. Do not fetch stock photos to fill those gaps. The plan is
designed so none are needed (how-it-works becomes typographic; tier cards show
their cloth, not their packaging).

Image rules (apply everywhere):

- `next/image` with a static import, `placeholder="blur"`, correct `sizes`.
  `priority` only on the home hero image.
- Frame: `rounded-m overflow-hidden bg-paper border border-line`. Photos are
  never rotated, tilted, skewed or put in an arc.
- Fabric photos are always 4:5 (`aspect-[4/5]`, `object-cover`). The one hover
  effect on a photo is `transform: scale(1.03)` over 600ms `ease-tailor` inside
  its frame (CSS transition, disabled under reduced motion).
- `alt` describes the cloth or box plainly ("Charcoal herringbone wool, folded").

---

## 3. Information architecture after the redesign

Routes do not change (AGENTS.md §4). What changes is what is *on* them.

### `/` — five sections, roughly 4–5 viewports on desktop

1. **Hero** (fits the first viewport, `min-h-[100svh]`, nav included).
   Grid: copy in `lg:col-span-6`, photo in `lg:col-start-7 lg:col-span-6`.
   - `h1` (sentence case, two lines max): **"Cloth worth gifting."**
   - Supporting line (max 44ch): "Premium unstitched shirting and suiting, boxed and ribboned. You choose the cloth; he has it stitched by his own tailor."
   - Actions: one **suiting-filled pill** button "Choose the cloth" → `/fabrics`, and a quiet text link "See the boxes" → `/boxes`. (Not red: the nav's "Build a gift" is already the single red primary in view.)
   - Small tagline under the actions, chalk colour: "Select · Stitch · Stand out".
   - Photo: `hero-box.jpg`, 4:5, `priority`. Below 900px the photo sits under the copy, full shell width, aspect 4:5 capped at `max-h-[70svh]`.
   - Entrance: copy and photo fade/rise once on mount with `motion` (opacity 0→1, y 16→0, 0.8s ease-tailor, photo 0.1s later). No scroll pinning, no scrub.
2. **The cloth** — `h2` "Eight cloths, chosen by hand", one line of copy, then a 4-up grid (2-up below 900px) of **four** `FabricCard`s (Oxford white, Sky end-on-end, Navy twill, Charcoal herringbone), then a text link "See all eight" → `/fabrics`.
3. **The boxes** — a single band: `box-shirt.jpg` in `lg:col-span-7` (16:9 → crop to 3:2 on desktop with `object-cover`), copy in `lg:col-span-5` vertically centred: `h2` "Boxed, ribboned, ready to hand over", "Three boxes, from ₹2,499." (use `formatINR(boxes[0].priceInr)`), a short list of the three box names with prices, and a link "Compare the boxes" → `/boxes`.
4. **How it works** — typographic, no photos, no GSAP. `h2` "How it works". Three columns (stack below 900px), each: Bodoni numeral (`text-5xl`, chalk), `h3` title, one paragraph. A single static dashed rule in `--color-thread` (CSS `border-top: 1px dashed`) runs above the three columns. Copy:
   1. **You select** — "Pick the cloth, the box and the note. We wrap it, tie the ribbon and deliver it to his door."
   2. **He stitches** — "He takes the lengths to the tailor he trusts. Every box carries a care note and the length for each garment."
   3. **He stands out** — "A shirt cut for his shoulders, a suit that fits the way he stands — in cloth you chose."
5. **Occasions** — keep `Occasions` / `FlowingMenu` as is (it is the home page's one signature hover effect). Tighten its padding to the new rhythm.

Removed from home: `MadeGallery` (stock photos posing as customers' garments —
misleading and the worst offender), the unboxing hero.

### `/fabrics`

- `page-top` section: `h1` "The cloth", one-line intro ("Eight cloths we would wear ourselves. Every length is cut to measure for one garment.").
- Filter: three pills — All, Shirting, Suiting — as a `role="radiogroup"` (or tablist) with a `motion` `layoutId` active pill in suiting. Filtering animates cards with `motion` `AnimatePresence` + `layout` (opacity/scale only).
- Grid of all eight `FabricCard`s: 4 columns ≥ 1100px, 3 ≥ 900px, 2 below.
- `FabricCard` (new, `src/components/fabrics/FabricCard.tsx`):
  photo (4:5) → kind tag (`Shirting`/`Suiting`, small pill, border-line) and price (`formatINR`, tabular-nums) on one row → name (`font-display text-2xl`) → spec line in chalk: composition · count-or-weight · `{lengthM} m {lengthLabel} length` → `wear` line (chalk, `text-[15px]`) → button "Add to a box" (outline pill, suiting text). The button puts the fabric in the draft gift (same store call `SwatchDetails`/`SwatchBook` use today for "Use in my box") and `navigate("/build")`.
- Keep the existing `Fabric` data and copy. The card replaces `SwatchBook`, `SwatchDetails`, `Stack`, `GlareHover`, `WeaveLens`, `FabricTexture`.

### `/boxes`

- `page-top` section: `h1` "Choose his box", intro line (keep current).
- Banner: `box-shirt.jpg`, full shell width (12 cols), `aspect-[21/9]` desktop / `aspect-[4/3]` mobile, `object-cover`.
- Three tier cards in a row (stack below 900px), **no tilt**. Card = `bg-paper rounded-m border border-line p-6`:
  - `FabricTrio` preview (new, see below) at top,
  - name (`font-display text-3xl`) + price (`formatINR`) on one row,
  - `line`, then `includes` as a list with 1px `border-line` separators,
  - "Best for: {bestFor}" in chalk,
  - button "Choose this box" (outline pill) → sets box in store and `navigate("/build")` (current behaviour).
  - The middle tier (Suit Box) gets a small "Most chosen" tag? **No** — that would be an invented claim. Equal cards.
- `FabricTrio` (`src/components/boxes/FabricTrio.tsx`): 2–3 overlapping fabric photo tiles (square, `rounded-s`, 1px paper ring, each offset ~28% of its width, slight z-stacking, no rotation) showing illustrative contents. Add to `BoxTier` in `data.ts`: `readonly preview: readonly string[]` (fabric ids). Values: shirt box `["oxford-white", "<bengal stripe id>"]`; suit box `["<navy twill id>", "<sky end-on-end id>"]`; groom's trunk `["<charcoal herringbone id>", "oxford-white", "<ivory linen id>"]`. Look the real ids up in `data.ts`.

### `/build`

Keep all logic (`slots.ts`, store, `BuildParams`). Visual fixes only:
- Layout: steps in `lg:col-span-7`; the preview column `lg:col-start-9 lg:col-span-4` and `lg:sticky lg:top-[120px] self-start`. Nothing overlaps or clips at 1024, 1280, 1440. Below 900px the preview comes after step 3, before "Add to bag".
- `StepBox` cards: add the tier's `FabricTrio` (small) above the name.
- `StepFabrics` chips: replace the CSS texture swatch with a 40×40 `rounded-s` fabric photo thumbnail (`next/image`, `sizes="40px"`).
- `PreviewBox` → rename/rewrite as `GiftSummary`: paper card with the chosen box name + price, the chosen fabrics as rows (48px thumbnail, name, price), a 1px rule, total (`formatINR`, tabular-nums), and the existing `GiftCard` (TextType note) beneath. No CSS box illustration.
- Remove `Magnet` around "Add to bag"; keep `ClickSpark`.

### `/corporate`

- Keep the dark suiting section and the enquiry form + validation exactly as they work today.
- Remove the stats row (`CountUp`) and the client marquee (`LogoLoop`): the numbers (12,000 boxes, 180 companies, 40 cities) and the ten company names are placeholders, not facts. Leave a `TODO(client)` comment in `Corporate.tsx` noting both can return once the client supplies real figures and permission to show logos.
- Add `hero-box.jpg` to the intro: copy `lg:col-span-6`, photo `lg:col-start-8 lg:col-span-5`, 4:5.

### Info pages (`/about` etc.)

- Give `InfoPage` an optional `image?: { src: StaticImageData; alt: string }` rendered under the `h1` intro as a 16:9 crop (`object-cover`), full content width.
- `/about` uses `fabric-herringbone.jpg` ("Charcoal herringbone wool, folded"). Other info pages: no image.

### Footer (all routes)

- Keep: top stitch line (GSAP draw-once), logo, line, three link columns, bottom bar.
- Remove `CircularText` badge and `TextPressure`.
- Wordmark: a static `KUSHAGRA` in Bodoni Moda 400, `font-size: clamp(3.5rem, 13vw, 11rem)`, `letter-spacing: -0.01em`, `line-height: 0.9`, suiting, centred (still the one centred layout), `aria-hidden="true"`. No hover effect. This roughly halves the footer height.

---

## 4. Global polish

- **Rhythm:** change `section-pad` to `padding-block: clamp(72px, 9vw, 128px)` and `page-top` to `padding-top: clamp(132px, 13vw, 176px)` (in `globals.css` `@utility` blocks). Nothing on the site should show more than ~160px of empty vertical space between content.
- **Remove the unboxing hero:** delete `home/HeroBox.tsx`, rewrite `home/Hero.tsx`, and delete the whole "Hero unboxing" CSS block in `globals.css` (from the `Hero unboxing (home/Hero.tsx, home/HeroBox.tsx)` header through the `@keyframes hero-cue` block, just before the "Reduced motion" header). Keep `HEAD_SCRIPT` and `html[data-js]` as they are (the preloader still uses `data-preloaded`; `data-js` is harmless).
- **Metadata:** in `layout.tsx` Open Graph image → `/og.jpg` (1200×630, alt "A Kushagra shirt box with two folded shirt lengths and a red ribbon"). Remove `images.unsplash.com` from `next.config.ts` `remotePatterns` once no Unsplash URL remains (`grep -r unsplash src` must be empty).
- **Buttons:** one shared look. If a `Button`/pill class already exists, reuse it; otherwise add `.btn-primary` (red-deep fill, white text — the single red primary), `.btn-solid` (suiting fill, shirting text) and `.btn-outline` (1px suiting border, suiting text) as `@utility` in `globals.css`, all `rounded-pill`, `h-12 px-6`, Cabin 500 16px. No arrows or glyphs in labels.
- **Type check on copy:** sentence case, no eyebrows, no italic word in headings, no emoji (AGENTS.md §3).

---

## 5. Deletions (and their dependents)

Delete these files, then fix every import that breaks:

- `src/components/made/MadeGallery.tsx`
- `src/components/home/HeroBox.tsx`
- `src/components/fabrics/FabricTexture.tsx`, `SwatchBook.tsx`, `SwatchDetails.tsx`, `WeaveLens.tsx`
- `src/components/boxes/GiftBox.tsx` (used by `BagLine.tsx` — show the box's `FabricTrio` at 48px there instead)
- `src/components/builder/PreviewBox.tsx` (replaced by `GiftSummary.tsx`)
- `src/components/reactbits/Stack.tsx`, `GlareHover.tsx`, `TiltedCard.tsx`, `Magnet.tsx`, `CountUp.tsx`, `LogoLoop.tsx`, `CircularText.tsx`, `TextPressure.tsx`

In `data.ts`: remove `FabricTextureId` and `Fabric.texture`; add
`readonly image: StaticImageData` (import type from `next/image`) and set it per
fabric with static imports from `@/assets/photos/…`. Add `BoxTier.preview`.
Update the file's header comment.

React Bits that remain: `PillNav`, `StaggeredMenu`, `FlowingMenu`, `TextType`, `ClickSpark` (5 of 13).

---

## 6. Phases (do them in order; each ends green)

Each phase ends with `npm run typecheck && npm run lint` passing. Phases 3, 6 and
8 also run `npm run build`. **Do not commit** — the user will review the diff.

1. **Data + images.** `data.ts` changes (§5), `FabricCard`, `FabricTrio`. Temporarily keep old components compiling (or delete them in the same phase if simpler).
2. **`/fabrics`** — new page body with filter + grid; delete `SwatchBook` & friends, `Stack`, `GlareHover`, `WeaveLens`, `FabricTexture`.
3. **Home** — new `Hero`, "The cloth", "The boxes" band, typographic `HowItWorks`, `Occasions`; delete `MadeGallery`, `HeroBox`, hero CSS. Update `page.tsx`. `npm run build`.
4. **`/boxes`** — banner + flat tier cards; delete `TiltedCard`, `GiftBox` (fix `BagLine`).
5. **`/build`** — layout fix, thumbnails, `GiftSummary`; delete `PreviewBox`, `Magnet`.
6. **`/corporate` + footer + `InfoPage`/`about`** — remove `CountUp`, `LogoLoop`, `CircularText`, `TextPressure`; static wordmark; corporate photo; about image. `npm run build`.
7. **Global polish + docs** — rhythm utilities, buttons, OG/metadata, `next.config.ts`, and update `AGENTS.md`: §4 routes table row for `/` ("Hero, the cloth, the boxes, how it works, occasions"); §5 remove the hero-unboxing and footer-weight-axis exceptions; React Bits table → only the 5 survivors (mark the removed 8 as "Removed 2026-10 redesign" in one line below the table); §6 `Fabric` now carries `image`, `BoxTier` carries `preview`; add a short **§10 Photography** section summarising the image rules in §2 of this plan and pointing at `docs/PHOTO_SHOT_LIST.md`.
8. **Shot list + verification** — write `docs/PHOTO_SHOT_LIST.md` (see §7), run the full verification (§8), `npm run build`.

---

## 7. `docs/PHOTO_SHOT_LIST.md` (client-facing, plain English)

Write it for the client and their photographer. Open with: the current images are
AI-generated stand-ins showing the intended look; before launch, each must be
replaced with a photo of Kushagra's actual cloth and packaging, because customers
must see the real product. Then a table — one row per file in §2 plus the wishlist:

- Each fabric (8): folded length, same pale grey card surface, hard window light from the left at a low angle, shot 45° from above, 100mm macro, ≥ 2400×3000px, 4:5, no props.
- Hero: the real open box with three lengths, tissue, blank note card, loose ribbon, 4:5, ≥ 2400×3000.
- Shirt box, suit box, groom's trunk: each closed-with-bow and open, 16:9, ≥ 3000px wide.
- Wishlist (would let us add back richer sections): a tailor's hands chalk-marking our cloth; a man wearing a finished shirt/suit made from our cloth (with permission); real customer photos with consent for a "What he made of it" gallery; corporate order stacks.
- Delivery: JPEG or TIFF masters, sRGB, colour-checked against the real cloth. Drop them in `assets-src/` and replace the files in `src/assets/photos/` with the same names (we re-export at 84% quality).

---

## 8. Verification (Sonnet must do all of this before reporting done)

1. `npm run typecheck`, `npm run lint`, `npm run build` — all clean. Paste the tail of each in the report.
2. `grep -rn "unsplash\|FabricTexture\|GiftBox\|TiltedCard\|Magnet\|CountUp\|LogoLoop\|CircularText\|TextPressure\|GlareHover\|WeaveLens\|MadeGallery\|HeroBox\|PreviewBox" src` returns nothing.
3. Screenshots with the existing Playwright helper in the scratchpad
   (`C:\Users\rebel\AppData\Local\Temp\claude\C--Users-rebel-OneDrive-Documents-GitHub-Kushagra-Fabrics\94ddb23a-9fe0-4427-bf39-6f124dc0460b\scratchpad\shot.mjs`;
   dev server: `npx next dev -p 3123` from the repo, run in the background; the
   script takes route names without a leading slash, `home` for `/`, because Git
   Bash rewrites `/x` arguments into Windows paths). Capture `home fabrics boxes build corporate about` at 1440×900 and 390×844 and **look at every image** you capture. Check:
   - hero fully inside the first viewport at 1440×900 (headline, actions and photo visible without scrolling);
   - home total height ≤ ~5,200px at 1440 (it was 8,683);
   - no horizontal scroll at 390px; no overlapping or clipped elements;
   - every photo shows the right cloth for its label;
   - only one red filled button visible per viewport.
4. Reduced motion: run one capture with `reducedMotion: 'reduce'` in the Playwright context and confirm content is fully visible (no elements stuck at opacity 0).
5. Report: what changed per phase, anything you could not do, and any place you deviated from this plan and why.

Do not touch: the bag/zustand store shape, `slots.ts` logic, `SmoothScroll`,
`Preloader`, `HEAD_SCRIPT`, nav behaviour, the enquiry form's validation, or
package versions.
