# Kushagra photography shot list

This shot list is for the Kushagra team and the photographer.

The images currently on the website are AI-generated art-direction stand-ins that establish the intended visual tone, lighting, and composition. Before launch, each image must be replaced with genuine photographs of Kushagra's real unstitched cloth, gift boxes, and grosgrain ribbons. Customers must see the authentic materials, true colours, and genuine textures of what they are gifting.

---

## 1. Art direction and lighting guidelines

To keep the website cohesive, calm, and premium, every product photograph must adhere to a single unified setup:

- **Surface:** A pale neutral grey card background (`#EEF1F4` / shirting tone). Clean, flat, matte, and seamless. No wood, marble, or busy textures.
- **Lighting:** Hard, directional window light (or a directional strobe modifier) entering from the left at a low raking angle. Raking side light is essential because it casts minute shadows across the weave, revealing the true texture of twill diagonals, oxford pinpoint grain, and linen slubs.
- **Angle:** 45 degrees from above for all folded fabric cuts.
- **Lens:** 100mm macro (or equivalent prime macro lens) to eliminate wide-angle barrel distortion and maintain crisp sharpness from edge to edge.
- **Styling:** Neatly folded cuts showing clean fold lines. No props, no loose buttons, no sewing needles, and no decorative clutter. The cloth carries the frame.
- **Ribbons and packaging:** Navy paper boxes with clean 90-degree corners, crisp white tissue paper lining, and true red grosgrain ribbon (`#E63339`), hand-tied.

---

## 2. Core launch shot list

Every file listed below replaces an existing placeholder in `src/assets/photos/`.

| File name | Subject and composition | Aspect ratio | Minimum resolution | Location on website |
| --- | --- | --- | --- | --- |
| `hero-box.jpg` | Open navy gift box holding three folded fabric lengths (white oxford, sky end-on-end, charcoal herringbone), protective tissue, blank note card, and a loose red ribbon | 4:5 | 2400 × 3000 px | Home hero, corporate gifting intro |
| `box-shirt.jpg` | Slim navy shirt box with two folded shirt lengths (white oxford and Bengal stripe), lid beside it tied with a red grosgrain bow | 16:9 | 3000 × 1688 px | Home boxes section, `/boxes` banner |
| `fabric-oxford.jpg` | Oxford white shirting fabric, neatly folded length showing pinpoint weave | 4:5 | 2400 × 3000 px | Fabric catalogue (`oxford-white`) |
| `fabric-stripe.jpg` | Bengal stripe shirting fabric, neatly folded length showing clean woven stripe pattern | 4:5 | 2400 × 3000 px | Fabric catalogue (`bengal-stripe`) |
| `fabric-endonend.jpg` | Sky blue end-on-end shirting fabric, neatly folded length showing two-tone heathered weave | 4:5 | 2400 × 3000 px | Fabric catalogue (`sky-end-on-end`) |
| `fabric-linen.jpg` | Ivory linen shirting fabric, neatly folded length showing natural texture and slub | 4:5 | 2400 × 3000 px | Fabric catalogue (`ivory-linen`) |
| `fabric-twill.jpg` | Navy twill suiting fabric, neatly folded length showing defined diagonal twill lines | 4:5 | 2400 × 3000 px | Fabric catalogue (`navy-twill`) |
| `fabric-herringbone.jpg` | Charcoal herringbone wool suiting fabric, neatly folded length showing signature V-pattern | 4:5 | 2400 × 3000 px | Fabric catalogue (`charcoal-herringbone`), `/about` page |
| `fabric-velvet.jpg` | Bottle green cotton velvet suiting fabric, neatly folded length showing rich plush pile | 4:5 | 2400 × 3000 px | Fabric catalogue (`bottle-green-velvet`) |
| `fabric-chino.jpg` | Sandstone chino shirting and trouser fabric, neatly folded length showing structured weave | 4:5 | 2400 × 3000 px | Fabric catalogue (`sandstone-chino`) |

---

## 3. Box packaging shots

In addition to the core fabric cuts, clean 16:9 packaging shots of each box tier are required:

- **The Shirt Box:**
  - One shot closed with a hand-tied red grosgrain bow (16:9, ≥ 3000px wide).
  - One shot open displaying two neatly folded shirt lengths, gift note card, and care instruction insert (16:9, ≥ 3000px wide).
- **The Suit Box:**
  - One shot closed with a hand-tied red grosgrain bow (16:9, ≥ 3000px wide).
  - One shot open displaying one suit length and one shirt length with care notes (16:9, ≥ 3000px wide).
- **The Groom's Trunk:**
  - One shot closed with bow (16:9, ≥ 3000px wide).
  - One shot open displaying three lengths (e.g. suiting, bandhgala velvet, and shirting) (16:9, ≥ 3000px wide).

---

## 4. Editorial wishlist (for subsequent phases)

These photographs are not blockers for the core launch, but will allow us to restore rich editorial sections in future updates:

1. **A tailor at work:**
   - Close-up hands of a master tailor chalking lines onto our navy twill or charcoal herringbone on a wooden cutting table.
   - Tailor shears cutting cleanly through Kushagra cloth.
   - Natural workshop light, focus on the fabric and the craft.
2. **The finished garment in wear:**
   - A man wearing a bespoke suit tailored from Kushagra navy twill or charcoal herringbone.
   - A man wearing a crisp white Oxford or Bengal stripe shirt.
   - Honest, documentary-style photography in natural architectural settings (not catalogue studio poses). Written model consent required.
3. **Customer gallery ("What he made of it"):**
   - Real customer submissions of garments cut and stitched from Kushagra gift boxes.
   - Requires explicit permission and high resolution.
4. **Corporate bulk order stacks:**
   - Stacks of 20 to 50 finished navy boxes tied with red ribbons, prepared for corporate dispatch.
   - Demonstrates scale and gifting readiness.

---

## 5. File delivery specifications

- **Master format:** 16-bit TIFF or uncompressed high-resolution JPEG.
- **Colour profile:** sRGB, colour-checked against the physical fabrics under neutral 5000K daylight.
- **Sharpness:** Focus must be tack-sharp on the surface weave of the fabric. Avoid shallow depth-of-field where the fabric texture drops out of focus.
- **Delivery workflow:**
  1. Save raw master files in `assets-src/` for archival and future print needs.
  2. Export web assets to `src/assets/photos/` using the exact file names listed in Section 2 above (we re-compress at 84% quality for production web delivery).
