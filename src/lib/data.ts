/**
 * Single source of truth for Kushagra's catalogue.
 *
 * Prices are integer rupees — see src/lib/format.ts. Box prices cover the box
 * itself (packaging, ribbon, note card); fabric prices are added on top.
 *
 * Each fabric carries a statically imported `image` (src/assets/photos, 4:5)
 * and a one-line `wear` note for its card. Each box carries `preview`, the
 * ids of the fabrics shown in its FabricTrio — illustrative, not a promise of
 * what is inside.
 *
 * Contents of a box (what each slot holds, gift-wrap variants and so on) are
 * filled in by later phases. The types are final.
 */

import type { StaticImageData } from "next/image";

import oxfordImage from "@/assets/photos/fabric-oxford.jpg";
import stripeImage from "@/assets/photos/fabric-stripe.jpg";
import endOnEndImage from "@/assets/photos/fabric-endonend.jpg";
import linenImage from "@/assets/photos/fabric-linen.jpg";
import twillImage from "@/assets/photos/fabric-twill.jpg";
import herringboneImage from "@/assets/photos/fabric-herringbone.jpg";
import velvetImage from "@/assets/photos/fabric-velvet.jpg";
import chinoImage from "@/assets/photos/fabric-chino.jpg";

export type FabricKind = "shirting" | "suiting";

export type SlotKind = FabricKind | "any";

/* ------------------------------------------------------------- occasions -- */

export interface Occasion {
  readonly id: string;
  /** Sentence case, as it appears on the card. */
  readonly name: string;
  /** One line written for the day — shown beside the name and on the card. */
  readonly line: string;
}

export const occasions: readonly Occasion[] = [
  {
    id: "raksha-bandhan",
    name: "Raksha Bandhan",
    line: "From a sister, for the brother who has everything.",
  },
  {
    id: "wedding",
    name: "Wedding",
    line: "For the groom, the baraat and the father of the bride.",
  },
  {
    id: "diwali",
    name: "Diwali",
    line: "A festive box that outlasts the sweets.",
  },
  {
    id: "fathers-day",
    name: "Father's Day",
    line: "For the man who taught you how to dress.",
  },
  {
    id: "anniversary",
    name: "Anniversary",
    line: "Something he'll wear to the next one.",
  },
  {
    id: "corporate",
    name: "Corporate",
    line: "Boxes for your team, with your note inside.",
  },
];

/* --------------------------------------------------------------- fabrics -- */

/** What one length of the cloth is cut for — the label shown in the UI. */
export type FabricLengthLabel = "shirt" | "suit" | "bandhgala" | "trouser";

export interface Fabric {
  readonly id: string;
  readonly name: string;
  readonly kind: FabricKind;
  /** Mill composition, e.g. "100% cotton" or "70% wool 30% poly". */
  readonly composition: string;
  /** Yarn count ("2/40s", "60 lea"), or null when the cloth is quoted by weight. */
  readonly count: string | null;
  /** Fabric weight ("260 gsm"), or null when the cloth is quoted by count. */
  readonly weight: string | null;
  /**
   * What one length is cut for. Sandstone chino is cut as a trouser length but
   * is a shirting cloth, so its kind stays "shirting" and only this label
   * reads "trouser".
   */
  readonly lengthLabel: FabricLengthLabel;
  /** Length of one cut, in metres. */
  readonly lengthM: number;
  /** One line on how the cloth wears. */
  readonly wear: string;
  /** Photograph of the folded cloth, 4:5. */
  readonly image: StaticImageData;
  /** Price for one length, in integer rupees. */
  readonly priceInr: number;
}

export const fabrics: readonly Fabric[] = [
  {
    id: "oxford-white",
    name: "Oxford white",
    kind: "shirting",
    composition: "100% cotton",
    count: "2/40s",
    weight: null,
    lengthLabel: "shirt",
    lengthM: 1.6,
    wear: "Crisp for office mornings, softens beautifully after a few washes.",
    image: oxfordImage,
    priceInr: 1800,
  },
  {
    id: "bengal-stripe",
    name: "Bengal stripe",
    kind: "shirting",
    composition: "100% cotton",
    count: "2/60s",
    weight: null,
    lengthLabel: "shirt",
    lengthM: 1.6,
    wear: "A quiet stripe that reads as solid from across the room.",
    image: stripeImage,
    priceInr: 2200,
  },
  {
    id: "sky-end-on-end",
    name: "Sky end-on-end",
    kind: "shirting",
    composition: "100% cotton",
    count: "2/80s",
    weight: null,
    lengthLabel: "shirt",
    lengthM: 1.6,
    wear: "The finest shirting we stock — the collar rolls exactly where it should.",
    image: endOnEndImage,
    priceInr: 2600,
  },
  {
    id: "ivory-linen",
    name: "Ivory linen",
    kind: "shirting",
    composition: "100% linen",
    count: "60 lea",
    weight: null,
    lengthLabel: "shirt",
    lengthM: 1.6,
    wear: "Open and airy; it creases by lunch and looks better for it.",
    image: linenImage,
    priceInr: 3400,
  },
  {
    id: "navy-twill",
    name: "Navy twill",
    kind: "suiting",
    composition: "70% wool 30% poly",
    count: null,
    weight: "260 gsm",
    lengthLabel: "suit",
    lengthM: 3.25,
    wear: "Holds a crease from the morning meeting to the last train home.",
    image: twillImage,
    priceInr: 6800,
  },
  {
    id: "charcoal-herringbone",
    name: "Charcoal herringbone",
    kind: "suiting",
    composition: "80% wool 20% poly",
    count: null,
    weight: "280 gsm",
    lengthLabel: "suit",
    lengthM: 3.25,
    wear: "The zigzag does the talking, so the jacket does not have to.",
    image: herringboneImage,
    priceInr: 7200,
  },
  {
    id: "bottle-green-velvet",
    name: "Bottle green velvet",
    kind: "suiting",
    composition: "cotton velvet",
    count: null,
    weight: "340 gsm",
    lengthLabel: "bandhgala",
    lengthM: 2.5,
    wear: "Heavy, quiet and deep — cut for bandhgalas and evening rooms.",
    image: velvetImage,
    priceInr: 7800,
  },
  {
    id: "sandstone-chino",
    name: "Sandstone chino",
    kind: "shirting",
    composition: "98% cotton 2% elastane",
    count: null,
    weight: null,
    lengthLabel: "trouser",
    lengthM: 1.3,
    wear: "Soft enough for Sundays, tough enough for every weekday between.",
    image: chinoImage,
    priceInr: 2400,
  },
];

/* ----------------------------------------------------------------- boxes -- */

export interface BoxSlot {
  /** What may go into this slot. */
  readonly kind: SlotKind;
  /** How many lengths the slot holds. */
  readonly count: number;
  /** Shown on the box card and in the builder. */
  readonly label: string;
}

export interface BoxTier {
  readonly id: string;
  readonly name: string;
  /** One line on the box card. */
  readonly line: string;
  /** Price of the box itself, in integer rupees. Fabric is added on top. */
  readonly priceInr: number;
  readonly slots: readonly BoxSlot[];
  /** What arrives with the cloth. */
  readonly includes: readonly string[];
  /** Who this box is for. */
  readonly bestFor: string;
  /** Fabric ids shown in the box's FabricTrio — illustrative contents. */
  readonly preview: readonly string[];
}

export const boxes: readonly BoxTier[] = [
  {
    id: "shirt-box",
    name: "The Shirt Box",
    line: "Two shirt lengths of 1.6 m, wrapped and ribboned.",
    priceInr: 2499,
    slots: [{ kind: "shirting", count: 2, label: "Two shirting lengths" }],
    includes: [
      "Two shirt lengths of 1.6 m",
      "Gift card with your note",
      "Care note for his tailor",
      "Red grosgrain ribbon, hand-tied",
    ],
    bestFor: "Rakhi, Diwali and every shirt he is missing",
    preview: ["oxford-white", "bengal-stripe"],
  },
  {
    id: "suit-box",
    name: "The Suit Box",
    line: "One suit length of 3.25 m and one shirt length.",
    priceInr: 6999,
    slots: [
      { kind: "shirting", count: 1, label: "One shirting length" },
      { kind: "suiting", count: 1, label: "One suiting length" },
    ],
    includes: [
      "One suit length of 3.25 m",
      "One shirt length of 1.6 m",
      "Gift card with your note",
      "Care note for his tailor",
      "Red grosgrain ribbon, hand-tied",
    ],
    bestFor: "Weddings, and the first suit he owns outright",
    preview: ["navy-twill", "sky-end-on-end"],
  },
  {
    id: "grooms-trunk",
    name: "The Groom's Trunk",
    line: "One suit length, two shirt lengths, a silk pocket square, in a keepsake trunk.",
    priceInr: 14999,
    slots: [
      { kind: "shirting", count: 2, label: "Two shirting lengths" },
      { kind: "suiting", count: 1, label: "One suiting length" },
    ],
    includes: [
      "One suit length of 3.25 m",
      "Two shirt lengths of 1.6 m",
      "Silk pocket square",
      "Keepsake wooden trunk",
      "Gift card with your note",
      "Care note for his tailor",
    ],
    bestFor: "The groom, the baraat and the father of the bride",
    preview: ["charcoal-herringbone", "oxford-white", "ivory-linen"],
  },
];

/* --------------------------------------------------------------- lookups -- */

export function getOccasion(id: string | null): Occasion | undefined {
  if (id === null) return undefined;
  return occasions.find((occasion) => occasion.id === id);
}

export function getFabric(id: string | null): Fabric | undefined {
  if (id === null) return undefined;
  return fabrics.find((fabric) => fabric.id === id);
}

export function getBox(id: string | null): BoxTier | undefined {
  if (id === null) return undefined;
  return boxes.find((box) => box.id === id);
}

/* ------------------------------------------------------------- slot rules -- */

/** Total number of lengths a box holds. */
export function boxSlotCount(box: BoxTier): number {
  return box.slots.reduce((total, slot) => total + slot.count, 0);
}

/** How many lengths of a given kind the box will accept. */
export function boxCapacityFor(box: BoxTier, kind: FabricKind): number {
  return box.slots.reduce(
    (total, slot) => (slot.kind === "any" || slot.kind === kind ? total + slot.count : total),
    0,
  );
}

/**
 * Trims a fabric selection so it obeys the box's slot rules, keeping the
 * giver's order wherever possible. Fills specific slots first, then "any".
 */
export function fitSelection(box: BoxTier, fabricIds: readonly string[]): string[] {
  const pool: string[] = [...fabricIds];
  const chosen: string[] = [];

  const orderedSlots = [...box.slots].sort((a, b) => {
    if (a.kind === b.kind) return 0;
    if (a.kind === "any") return 1;
    if (b.kind === "any") return -1;
    return 0;
  });

  for (const slot of orderedSlots) {
    let filled = 0;
    let index = 0;
    while (filled < slot.count && index < pool.length) {
      const candidate = pool[index];
      if (candidate === undefined) {
        index += 1;
        continue;
      }
      const fabric = getFabric(candidate);
      const fits = fabric !== undefined && (slot.kind === "any" || fabric.kind === slot.kind);
      if (fits) {
        chosen.push(candidate);
        pool.splice(index, 1);
        filled += 1;
      } else {
        index += 1;
      }
    }
  }

  return chosen;
}

/** True when every slot in the box is filled. */
export function isSelectionComplete(box: BoxTier, fabricIds: readonly string[]): boolean {
  return fitSelection(box, fabricIds).length === boxSlotCount(box);
}

/** Box price plus the price of every selected length. Ignores unknown ids. */
export function selectionPriceInr(box: BoxTier, fabricIds: readonly string[]): number {
  const fabricTotal = fabricIds.reduce((total, id) => {
    const fabric = getFabric(id);
    return fabric === undefined ? total : total + fabric.priceInr;
  }, 0);
  return box.priceInr + fabricTotal;
}
