# Hero plan: the unboxing, rebuilt as a product film

Date: 2026-10-20 · Branch: `draft-01` · Status: **shipped on branch `hero-webgl` (P0–P5 done, 2026-10-20). See §8 for what was built and measured.**

The idea stays: you scroll and the box opens. What has to change is the
drawing, the timing and the layout. `AGENTS.md` is still the contract; §7 lists the
clauses this plan would change.

---

## 1. What is wrong today (audited at 1440×900 and 390×844, nine scroll points)

| Where | What is on screen | Why it reads cheap |
| --- | --- | --- |
| **The box** | Flat navy CSS planes with a grid-noise texture. Two faces get a 22% black overlay, and that is the whole lighting model. | No edge thickness, no bevel highlight, no shading where walls meet the floor. It looks like a diagram of a box, not a box. Our own art-direction photo `src/assets/photos/hero-box.jpg` shows the object it should be. |
| **Ribbon and bow** | Two red rectangles plus a bow made of two outlined ellipses and a dot. The ribbon slides off sideways like a sticker. | Clip art. A grosgrain ribbon has width, sheen and slack. In the photo it lies coiled on the floor. |
| **Tissue** (45–100%) | Translucent white triangles that stick out past the walls. At 60% and later the viewport edge cuts them off. | They read as broken polygons or paper planes, and the cropping looks like a bug. |
| **The cloth** (60–85%) | One flat rectangle rises straight up out of the box. | It looks like a board. Nothing drapes, folds or catches the light, so the product is the worst-drawn thing in the scene. |
| **Hand-off** (85–90%) | A large navy square appears behind the box with nothing causing it. | This is the worst frame in the sequence: two unrelated objects overlap. |
| **End frame** | A hard two-thirds split: a flat twill panel with the headline, and a shrunken empty box pushed against the right edge and cut off. | The payoff is an empty box. The twill gradient also shows moiré at some DPRs. |
| **Composition** | The box is 28vw wide and centred in the right half, with empty bands above and below it. The left column holds a four-step tutorial list. | The scale is timid, the dead space is unplanned, and the list competes with the object. |
| **Timing** | 250% pin, and every tween uses `ease: "none"`. | Everything moves at the same constant speed, with no anticipation, settle or overlap, so nothing has weight. |
| **Copy and a11y** | The real `h1` is hidden until 88% scroll. The CTAs are `inert` until 97%. | Someone who doesn't scroll never sees the headline or reaches "Build a gift box", whether by keyboard or by mouse. That costs conversions and SEO. |
| **Mobile** | Four static frames in a bordered carousel. | The scroll-to-open concept is gone. On mobile it reads as a gallery of diagrams. |

**Verdict:** the CSS-3D approach has hit its ceiling. Gradients cannot give a box
real light, real thickness or real fabric. Polishing it further would mean
building on a weak base.

---

## 2. Concept: one continuous shot

Treat the hero like a 6-second product film that the visitor scrubs with the
scroll wheel. It is one camera, one light and one object, and only one thing
moves at a time.

The target look is `hero-box.jpg`, because the brand already chose it. It shows
soft daylight from the top left, a navy linen-board box, white tissue, a red
grosgrain ribbon and three folded lengths: **Oxford white, Sky end-on-end and
Charcoal herringbone** (real catalogue fabrics in `data.ts`). It also has a
blank note card.

### Storyboard (desktop, pin 200%)

| Progress | Beat | Craft detail |
| --- | --- | --- |
| **Load** | The closed box sits large (about 46vw) to the right of centre on an invisible floor, with a soft contact shadow and a tied bow. On the left: the **h1, the sub-line and both CTAs, visible and usable**, plus a stitched scroll cue. | When idle, the camera breathes about 1° and pointer parallax adds ±2°. The object feels alive before anyone touches it. |
| 0.00–0.10 | **Anticipation.** The copy steps back (fade plus a 16px lift), and the camera eases in about 8%. | Lead with the camera, not the object. |
| 0.10–0.28 | **Ribbon.** The bow pulls loose, the tails slip off the lid edges, and the ribbon drops and coils on the floor as in the photo. | The tails lag behind the knot. That secondary motion is what makes it read as fabric. |
| 0.28–0.46 | **Lid.** It rises slowly at first, like a snug lid fighting air pressure, then releases, tips back and comes to rest leaning on the back of the box. It never flies off-screen. | The slow start (`expo.in` over the first 20%) is the detail people notice in a premium box. |
| 0.46–0.62 | **Tissue.** The two sheets fold open with a soft curl, a bend in the shader rather than a rigid hinge. | Tissue stays inside the frame at every point. |
| 0.62–0.86 | **Reveal.** The camera tilts down towards top-down while the three folded lengths lift a few mm and fan apart. Sheen runs across the cloth as the angle changes. | This glint is the signature moment, and the product is the payoff. |
| 0.86–1.00 | **Settle.** The note card slides out. Small chalk-style leader lines name each cloth ("Oxford white · shirting" …). A short closing line and the CTA follow. | The callouts teach the product without a paragraph. |

**Overlay, the whole way through:** bottom-left, a small step counter
(`01 / 04 Untie the ribbon`, Cabin 15px, chalk, tabular-nums) above a hairline
that fills with a **dashed thread stitch** as progress advances. That stitch is
the brand signature, and it replaces the large four-step list.

**Mobile:** the same film with a shorter pin (150%), framed for portrait, and the
copy set below it. The carousel is removed.

---

## 3. Recommended technique: real-time 3D (React Three Fiber)

| Option | Fidelity | Cost | Verdict |
| --- | --- | --- | --- |
| **A. WebGL: three + @react-three/fiber + drei** | Real light, bevelled edges, cloth sheen (`MeshPhysicalMaterial.sheen`), contact shadow. The cloths use our own fabric photos as textures. | Adds about 250–270 KB gzipped (measured in P0), lazy-loaded after first paint. | **Recommended.** It is the only option that reaches the target and can be built now. |
| B. Keep CSS 3D, re-art-direct | Better than today, but still planes and gradients. | No new dependencies. | Fallback if the A spike fails its gate. |
| C. Scrubbed image sequence (Apple-style) | Photographic | Needs footage we don't have, and 3–6 MB of frames on Indian mobile data. | Revisit after the real photo shoot. |

### Architecture (option A)

```
src/components/home/hero/
  Hero.tsx            server-safe shell: copy, overlay, poster <Image priority>
  HeroStage.tsx       "use client": ScrollTrigger pin, scrubs one progress value
  HeroCanvas.tsx      next/dynamic(ssr:false): <Canvas frameloop="demand">
  scene/Box.tsx       RoundedBox walls, liner, lid with skirt
  scene/Ribbon.tsx    Tube along a curve; tied → fallen control points lerped
  scene/Tissue.tsx    plane plus vertex bend shader
  scene/Cloths.tsx    three folded lengths, sheen material, fabric photo maps
  scene/Lights.tsx    key top-left, soft fill, rim; Lightformer environment
  scene/textures.ts   procedural linen-board and grosgrain normal maps (CanvasTexture, built once)
src/lib/heroTimeline.ts  pure progress → pose function per beat (unit-testable, like slots.ts)
```

- **Ownership:** GSAP + ScrollTrigger owns scroll and writes one `progress`
  number. R3F only renders it (`invalidate()` on change, nothing per frame while
  idle). Lenis stays the only scroller. The wiring in `SmoothScroll.tsx` doesn't
  change.
- **Easing:** each beat has its own curve with 15–25% overlap between beats, and
  `scrub: 0.8`. If someone stops at ≥ 0.93, snap to the end. There is no other
  snapping, because that feels like hijacking the scroll.
- **Colour match:** the canvas is transparent and the floor uses `ShadowMaterial`,
  so the page's `#EEF1F4` shows through and the canvas has no visible edge. The
  materials are calibrated so the navy matches `--color-suiting` under tone mapping.
- **Poster:** a still of the closed box, rendered once from the scene and saved as
  AVIF/WebP, is the LCP and is server-rendered with `priority`. The canvas
  cross-fades in over it at the same framing, so there is no jump.
- **Fallbacks:** reduced motion, no WebGL or a failed context all get a static
  poster of the open box plus the full copy. Low-power devices (`deviceMemory ≤ 2`)
  get the same.
- **Budget:** DPR clamped to [1, 1.75], one shadow, textures ≤ 1024², and the
  render pauses off-screen. Targets: LCP < 2.5s, CLS 0, 60fps on an M1 and ≥ 45fps
  on a mid-range Android. **Mobile Lighthouse performance must not drop more than
  5 points from today.**

### What gets deleted
`home/HeroBox.tsx`, the ~500-line "Hero unboxing" block in `globals.css`, the
`HeroFrames` carousel, the `--px/--py` measurement code and `heroTwillStyle`.

---

## 4. Layout and type

- Load frame: copy in columns 1–5. The `h1` stays "Give him the cloth. Let him make
  it his." at `clamp(3rem, 6vw, 6rem)` so it fits in two lines. The canvas is
  full-bleed behind the copy, with the object framed in columns 6–12 and allowed to
  run slightly past the right edge.
- The object sits at the optical centre (about 46% from the top), not the
  geometric centre.
- There is one primary red action per view. The nav already has the red "Build a
  gift", so the hero CTA is `.btn-solid` and "See the fabrics" is `.link-quiet`.
- All copy stays in sentence case, with no eyebrows and no glyphs, per `AGENTS.md` §3.

---

## 5. Phases and gates

| # | Phase | Done when |
| --- | --- | --- |
| P0 | **Spike, with a go/no-go gate.** R3F wired to the GSAP progress value; box, lid and lights only. | A screenshot next to `hero-box.jpg` reads as a real object. **If it doesn't, stop and take option B.** |
| P1 | Model: ribbon and bow, tissue, three cloths, note card, procedural textures. | Each part looks right in a still at progress 0, 0.5 and 1. |
| P2 | Choreography: `heroTimeline.ts`, per-beat easing, camera path. | Screenshots at nine progress points show no cropped geometry, no dead frames and one action per beat. |
| P3 | Copy and overlay: load copy, step counter with stitch progress, end callouts and CTA. | The h1 and CTAs are visible and focusable at load. axe is clean. |
| P4 | Mobile and fallbacks: portrait framing, poster, reduced motion, no WebGL. | Checked at 360, 768, 1280 and 1440. A reduced-motion run shows the static end state. |
| P5 | Performance, QA and docs: Lighthouse, frame timing, verifier and taste-judge passes; update `AGENTS.md` and memory. | Budgets in §3 met. `lint`, `typecheck` and `build` pass. |

---

### P0 result (2026-10-20): gate passed

Spike lives at `/hero-lab` (dev only; production answers 404, noindex) in
`src/components/home/hero/`: `progress.ts`, `HeroCanvas.tsx`, `HeroLab.tsx`,
`scene/Box.tsx`, `scene/Lights.tsx`, `scene/textures.ts`.

- **Reads as an object:** extruded wall frames with a bevelled rim, navy
  book-cloth (procedural normal map), a lid skirt with real thickness, a paper
  label carrying the logo, and studio light with a soft key-light shadow plus a
  baked contact patch. The lid lift scrubs smoothly through Lenis and the pin.
- **Shadows:** drei `ContactShadows` drew nothing with three r186 (it stayed blank
  even when forced to red). It was replaced by a VSM spot-light shadow on a
  `shadowMaterial` floor kept inside the light's cone, plus a canvas-baked
  contact patch.
- **Bundle, measured:** the lazy 3D chunks total **about 270 KB gzipped**: three
  is about 240 KB, and R3F plus drei about 28 KB. The plan's 170 KB guess was
  low. three cannot be cut much further, so the realistic budget is **≤ 250 KB
  lazy**. To get there, P5 drops drei (its `Environment` alone pulls in EXR/RGBE
  loaders) in favour of our own PMREM light-card environment and a
  rounded-box helper. The poster image remains the LCP, so the cost lands after
  first paint.
- **Still to do (P1):** the ribbon is flat tape with no bow, the board weave is
  too faint on top, there are no tissue or cloths yet, and the liner reads grey
  under the lid's shadow.

## 6. Decisions (resolved 2026-10-20)

1. **Technique:** option A (WebGL, adds three/R3F) or option B (stay in CSS)?
2. **First frame:** headline visible on load and returning at the end (recommended),
   or kept hidden until the box opens, as now?

## 7. `AGENTS.md` changes if A is chosen

- §1 Stack: add `three`, `@react-three/fiber@9`, `@react-three/drei`.
- §5 Ownership: add "Three.js (R3F): renders the hero scene only; GSAP drives
  its progress". Replace the "hero scrubs CSS custom properties" exception and the
  `heroTwillStyle` note. The sanctioned shadow becomes the scene's contact shadow.
- §4 Routes: unchanged.

## 8. Outcome (P1–P5, 2026-10-20)

Built in `src/components/home/hero/` with the choreography in
`src/lib/heroTimeline.ts`; the old `HeroBox.tsx` and its CSS-3D block are
gone, and so is drei (replaced by our own PMREM light-card environment and
three's `RoundedBoxGeometry`).

**The film:** the bow pulls through and both grosgrain bands peel off into
loose curls on the table; the lid lifts slowly (a snug lid), then is carried
back and propped behind the box at about 24°, with its label to the camera;
the tissue turns over the walls like a page, free edge first; the camera
tilts down as Oxford white, Sky end-on-end and Charcoal herringbone lift
apart; the note card ("Have it cut the way you like it.") slides out; paper
tags name each cloth and the closing line sets ("Choose the cloth. His
tailor does the rest.").

**Changes from the plan:**
- The cloth names are paper tags pinned to each length, not leader lines
  across the page, so they don't collide with the copy at any width.
- The lid is propped at about 24°, not standing upright: at 64° it filled the
  top of the frame and ran under the nav.
- No snap-to-end. ScrollTrigger snapping fights Lenis, and the film reads
  well without it.
- Pointer parallax fades out over the reveal, so the end frame matches the
  open poster exactly and the tags can use fixed positions.
- Mobile uses a square, full-bleed visual with a tighter lens. Phones get a
  512 px shadow map and a pixel ratio of 1.5 or less.

**Measured (production build):**

| | |
| --- | --- |
| Home first-load JS | 226 kB (was 223 kB). three is not in it |
| Lazy 3D chunks | about 256 KB gzipped, loaded on idle after first paint. This is 6 KB over the 250 KB target; almost all of it is three itself |
| LCP, desktop 1440×900 | 0.48 s (the closed poster); CLS 0.001 |
| LCP, mobile 390×844, 4× CPU, 1.6 Mbps | 1.36 s; CLS 0.005 |
| Posters | closed desktop 60 KB, open desktop 197 KB, mobile 37 KB / 72 KB (WebP; next/image re-encodes per size) |
| `/hero-lab` in production | 404 |
| Keyboard | skip link → nav → Build a gift box → See the fabrics. Copy and end actions are `inert` while off screen |

**Not verified:** real-device frame rate. Headless Chrome renders WebGL in
software, so frame timing there means nothing. Check on a mid-range Android
and an iPhone before launch.
