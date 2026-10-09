/**
 * Typed seed data for Kushagra phase 1.
 * Box contents (adders, linings, note cards) arrive in later phases;
 * the slot rules below are the contract the builder will enforce.
 */

export type FabricKind = "shirting" | "suiting";

export interface Occasion {
  id: string;
  label: string;
  /** One line shown under the occasion in the picker. */
  blurb: string;
  /** Rough gifting window, shown as supporting copy. */
  window: string;
}

export interface Fabric {
  id: string;
  name: string;
  kind: FabricKind;
  /** Weave / construction, e.g. "2-ply poplin". */
  weave: string;
  /** Colour description, never a token name. */
  colour: string;
  /** Price per metre in integer rupees. */
  pricePerMetreInr: number;
  blurb: string;
}

export interface BoxSlots {
  /** How many shirting fabrics this box holds. */
  shirting: number;
  /** How many suiting fabrics this box holds. */
  suiting: number;
}

export interface BoxTier {
  id: string;
  name: string;
  /** Box price in integer rupees, fabrics priced separately per slot. */
  priceInr: number;
  slots: BoxSlots;
  /** Max characters for the giver's note card. */
  noteLimit: number;
  blurb: string;
}

export const occasions: readonly Occasion[] = [
  {
    id: "raksha-bandhan",
    label: "Raksha Bandhan",
    blurb: "A rakhi promises protection. The box promises him a reason to dress for it.",
    window: "July to August",
  },
  {
    id: "wedding",
    label: "Wedding",
    blurb: "For the groom, the brother, the best man — fabric that survives seven pheras and every photograph.",
    window: "All season",
  },
  {
    id: "diwali",
    label: "Diwali",
    blurb: "New light, new cloth. The gift he opens before the first diya is lit.",
    window: "October to November",
  },
  {
    id: "anniversary",
    label: "Anniversary",
    blurb: "Years together, measured in metres of something he will actually wear.",
    window: "Any date that matters",
  },
  {
    id: "corporate",
    label: "Corporate gifting",
    blurb: "One invoice, many boxes, notes addressed by you and signed in your name.",
    window: "Year round",
  },
] as const;

export const fabrics: readonly Fabric[] = [
  {
    id: "giza-poplin",
    name: "Giza cotton poplin",
    kind: "shirting",
    weave: "2-ply poplin, 120s",
    colour: "crisp white",
    pricePerMetreInr: 1450,
    blurb: "The boardroom default. Cool, matte, holds a crease through a full day.",
  },
  {
    id: "sea-island-oxford",
    name: "Sea island oxford",
    kind: "shirting",
    weave: "basket weave oxford, 100s",
    colour: "pale sky",
    pricePerMetreInr: 1650,
    blurb: "Soft body with a dry hand. The shirt he reaches for on Fridays.",
  },
  {
    id: "jaquard-stripe",
    name: "Woven jaquard stripe",
    kind: "shirting",
    weave: "jaquard dobby, 110s",
    colour: "ivory with tonal stripe",
    pricePerMetreInr: 1850,
    blurb: "A stripe you feel before you see. Made for wedding evenings.",
  },
  {
    id: "linen-spread",
    name: "Wet-spun linen",
    kind: "shirting",
    weave: "plain weave linen, 40 lea",
    colour: "unbleached flax",
    pricePerMetreInr: 2100,
    blurb: "Rumpled on purpose. Breathes through every Indian summer.",
  },
  {
    id: "vicuna-touch-suiting",
    name: "Vicuna-touch worsted",
    kind: "suiting",
    weave: "twill worsted, super 130s",
    colour: "midnight navy",
    pricePerMetreInr: 4200,
    blurb: "Drapes like a whisper, photographs like a statement.",
  },
  {
    id: "sharkskin",
    name: "Sharkskin pick-and-pick",
    kind: "suiting",
    weave: "pick-and-pick twill, super 120s",
    colour: "slate grey",
    pricePerMetreInr: 3600,
    blurb: "A quiet sheen that reads expensive from three metres away.",
  },
  {
    id: "hopsack-blazer",
    name: "Wool hopsack",
    kind: "suiting",
    weave: "open hopsack, super 110s",
    colour: "deep olive",
    pricePerMetreInr: 3200,
    blurb: "The unstructured blazer cloth. Travels folded, hangs out clean.",
  },
  {
    id: "barathea-formal",
    name: "Barathea formal",
    kind: "suiting",
    weave: "barathea weave, super 140s",
    colour: "ink black",
    pricePerMetreInr: 4800,
    blurb: "Black-tie weight with a matte face. For nights with a dress code.",
  },
] as const;

export const boxTiers: readonly BoxTier[] = [
  {
    id: "single-cut",
    name: "The single cut",
    priceInr: 900,
    slots: { shirting: 1, suiting: 0 },
    noteLimit: 180,
    blurb: "One shirting fabric, folded with a note. The thoughtful small gift.",
  },
  {
    id: "two-ply",
    name: "The two-ply",
    priceInr: 1600,
    slots: { shirting: 2, suiting: 0 },
    noteLimit: 240,
    blurb: "Two shirtings that work as a pair. Our most-gifted box.",
  },
  {
    id: "full-measure",
    name: "The full measure",
    priceInr: 3200,
    slots: { shirting: 2, suiting: 1 },
    noteLimit: 320,
    blurb: "Shirts and a suit length. The box that changes his wardrobe.",
  },
] as const;

/** Total fabric slots a tier accepts. */
export function slotCount(tier: BoxTier): number {
  return tier.slots.shirting + tier.slots.suiting;
}

export function fabricById(id: string): Fabric | undefined {
  return fabrics.find((fabric) => fabric.id === id);
}

export function boxById(id: string): BoxTier | undefined {
  return boxTiers.find((tier) => tier.id === id);
}

export function occasionById(id: string): Occasion | undefined {
  return occasions.find((occasion) => occasion.id === id);
}
