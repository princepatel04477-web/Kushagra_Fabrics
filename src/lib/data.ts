/**
 * Single source of truth for Kushagra's catalogue.
 *
 * Prices are integer rupees — see src/lib/format.ts. Box prices cover the box
 * itself (packaging, ribbon, note card); fabric prices are added on top.
 *
 * Contents of a box (what each slot holds, gift-wrap variants and so on) are
 * filled in by later phases. The types are final.
 */

export type FabricKind = "shirting" | "suiting";

export type SlotKind = FabricKind | "any";

/* ------------------------------------------------------------- occasions -- */

export interface Occasion {
  readonly id: string;
  /** Sentence case, as it appears on the card. */
  readonly name: string;
  /** Who usually gives this gift. */
  readonly giver: string;
  /** One line explaining the occasion. */
  readonly line: string;
  /** Rough time of year, used for ordering cards. */
  readonly when: string;
  /** Fabric kinds that suit this occasion best. */
  readonly suggested: readonly FabricKind[];
}

export const occasions: readonly Occasion[] = [
  {
    id: "raksha-bandhan",
    name: "Raksha Bandhan",
    giver: "Sisters",
    line: "She ties the thread in August. He is still wearing the shirt in March.",
    when: "August",
    suggested: ["shirting"],
  },
  {
    id: "wedding-season",
    name: "Wedding season",
    giver: "Families",
    line: "For the brothers, uncles and grooms who need one good suit they own outright.",
    when: "November to February",
    suggested: ["suiting"],
  },
  {
    id: "diwali",
    name: "Diwali",
    giver: "Families and hosts",
    line: "A box that is not sweets, not dry fruit, and not forgotten by the next Diwali.",
    when: "October to November",
    suggested: ["shirting", "suiting"],
  },
  {
    id: "anniversary",
    name: "Anniversaries",
    giver: "Wives and partners",
    line: "He has the watch. Give him the shirt that fits because his tailor cut it.",
    when: "Any week of the year",
    suggested: ["shirting", "suiting"],
  },
  {
    id: "milestone",
    name: "Milestones",
    giver: "Parents and teams",
    line: "A first job, a promotion, a certificate — cloth for the year that follows it.",
    when: "Whenever it happens",
    suggested: ["shirting"],
  },
];

/* --------------------------------------------------------------- fabrics -- */

export interface FabricColour {
  readonly name: string;
  readonly hex: string;
}

export interface Fabric {
  readonly id: string;
  readonly name: string;
  readonly kind: FabricKind;
  /** Mill or region, for the fabric card. */
  readonly mill: string;
  readonly composition: string;
  /** Grams per square metre. */
  readonly gsm: number;
  readonly weave: string;
  /** How the cloth feels, in the hand. */
  readonly hand: string;
  readonly care: string;
  /** Price for one length, in integer rupees. */
  readonly priceInr: number;
  readonly colours: readonly FabricColour[];
  /** Occasions this cloth suits. */
  readonly occasionIds: readonly string[];
}

export const fabrics: readonly Fabric[] = [
  {
    id: "morning-poplin",
    name: "Morning poplin",
    kind: "shirting",
    mill: "Coimbatore",
    composition: "100% long-staple cotton",
    gsm: 110,
    weave: "Plain",
    hand: "Crisp and cool, with the dry snap of a well-ironed shirt.",
    care: "Machine wash cold, line dry, iron damp.",
    priceInr: 2100,
    colours: [
      { name: "Optic white", hex: "#F5F7F9" },
      { name: "Sky chalk", hex: "#C9DCEC" },
      { name: "Pencil stripe", hex: "#8FA3B8" },
    ],
    occasionIds: ["raksha-bandhan", "diwali", "anniversary", "milestone"],
  },
  {
    id: "evening-oxford",
    name: "Evening oxford",
    kind: "shirting",
    mill: "Ahmedabad",
    composition: "92% cotton, 8% linen",
    gsm: 140,
    weave: "Oxford",
    hand: "Soft from the first wear, with a faint basket texture under the thumb.",
    care: "Machine wash cold, tumble low, iron warm.",
    priceInr: 2450,
    colours: [
      { name: "Washed indigo", hex: "#4C6285" },
      { name: "Warm sand", hex: "#D9C7AD" },
      { name: "Charcoal chalk", hex: "#5E6773" },
    ],
    occasionIds: ["raksha-bandhan", "anniversary", "milestone"],
  },
  {
    id: "summer-linen-club",
    name: "Summer linen club",
    kind: "shirting",
    mill: "Belgian flax, woven in Erode",
    composition: "100% European linen",
    gsm: 165,
    weave: "Plain, slubbed",
    hand: "Open and airy. It creases by lunch and looks better for it.",
    care: "Machine wash cold, do not spin dry, iron damp.",
    priceInr: 3200,
    colours: [
      { name: "Raw flax", hex: "#E0D6C3" },
      { name: "Sea glass", hex: "#AFC4C0" },
      { name: "Faded rust", hex: "#B9774F" },
    ],
    occasionIds: ["diwali", "anniversary", "milestone"],
  },
  {
    id: "boardroom-twill",
    name: "Boardroom twill",
    kind: "suiting",
    mill: "Bhiwandi",
    composition: "100% merino wool",
    gsm: 260,
    weave: "Two-ply twill",
    hand: "Dry, dense and springy. It holds a crease through a ten-hour day.",
    care: "Dry clean only. Brush after wear, rest a day.",
    priceInr: 7900,
    colours: [
      { name: "Ink navy", hex: "#26303F" },
      { name: "Graphite", hex: "#4A525C" },
      { name: "Midnight black", hex: "#1B2433" },
    ],
    occasionIds: ["wedding-season", "milestone", "diwali"],
  },
  {
    id: "reception-satin",
    name: "Reception satin",
    kind: "suiting",
    mill: "Surat",
    composition: "70% wool, 30% silk",
    gsm: 240,
    weave: "Satin",
    hand: "Cool and fluid with a low sheen that only shows under evening light.",
    care: "Dry clean only. Press through a cotton cloth.",
    priceInr: 9600,
    colours: [
      { name: "Deep maroon", hex: "#5B2230" },
      { name: "Bottle green", hex: "#243B32" },
      { name: "Midnight navy", hex: "#1F2A3D" },
    ],
    occasionIds: ["wedding-season", "diwali"],
  },
  {
    id: "travel-hopsack",
    name: "Travel hopsack",
    kind: "suiting",
    mill: "Bhiwandi",
    composition: "98% merino wool, 2% elastane",
    gsm: 280,
    weave: "Hopsack",
    hand: "Open weave, a little give, and it shakes creases out overnight.",
    care: "Dry clean rarely. Steam in the bathroom, brush, rest.",
    priceInr: 8400,
    colours: [
      { name: "Loden", hex: "#3F4A3A" },
      { name: "Storm blue", hex: "#3B4B63" },
      { name: "Warm taupe", hex: "#7A6E5F" },
    ],
    occasionIds: ["wedding-season", "anniversary", "milestone"],
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
}

export const boxes: readonly BoxTier[] = [
  {
    id: "the-single",
    name: "The Single",
    line: "One length, one ribbon, one very good shirt.",
    priceInr: 900,
    slots: [{ kind: "any", count: 1, label: "One length of his cloth" }],
    includes: [
      "Rigid gift box in Kushagra suiting board",
      "Red grosgrain ribbon, hand-tied",
      "Note card in your words",
      "Measuring tape and a care card",
    ],
    bestFor: "A first gift, or a rakhi you have to post",
  },
  {
    id: "the-pair",
    name: "The Pair",
    line: "Two lengths — the weekday shirt and the one he keeps for dinners.",
    priceInr: 1400,
    slots: [
      { kind: "shirting", count: 1, label: "One shirting length" },
      { kind: "any", count: 1, label: "One more, his choice" },
    ],
    includes: [
      "Rigid gift box in Kushagra suiting board",
      "Red grosgrain ribbon, hand-tied",
      "Note card in your words",
      "Measuring tape and a care card",
      "Two cloth bags, one per length",
    ],
    bestFor: "Anniversaries and Diwali, when one shirt is not quite enough",
  },
  {
    id: "the-wardrobe",
    name: "The Wardrobe",
    line: "Two shirting lengths and a suiting length. A season, boxed.",
    priceInr: 2200,
    slots: [
      { kind: "shirting", count: 2, label: "Two shirting lengths" },
      { kind: "suiting", count: 1, label: "One suiting length" },
    ],
    includes: [
      "Deep gift box in Kushagra suiting board",
      "Red grosgrain ribbon, hand-tied",
      "Note card in your words",
      "Measuring tape and a care card",
      "Three cloth bags, one per length",
      "Tailor's instruction card with finished measurements",
    ],
    bestFor: "Weddings, milestone birthdays, and corporate gifting",
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
