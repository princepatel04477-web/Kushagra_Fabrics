/**
 * Pure slot logic for the gift builder — no React, no store — so it can be
 * unit-tested on its own. The builder chips, the "Add to bag" guard and the
 * box-change trimming all read from here.
 */

import {
  getFabric,
  type BoxTier,
  type Fabric,
  type FabricKind,
} from "./data";

export interface SlotRemaining {
  readonly shirting: number;
  readonly suiting: number;
}

/** Per-kind slot capacity of a box; "any" slots are counted separately. */
function capacitySplit(box: BoxTier): {
  readonly shirting: number;
  readonly suiting: number;
  readonly any: number;
} {
  let shirting = 0;
  let suiting = 0;
  let any = 0;
  for (const slot of box.slots) {
    if (slot.kind === "shirting") shirting += slot.count;
    else if (slot.kind === "suiting") suiting += slot.count;
    else any += slot.count;
  }
  return { shirting, suiting, any };
}

/** How many lengths of one kind a selection already holds. */
function countKind(selection: readonly string[], kind: FabricKind): number {
  let total = 0;
  for (const id of selection) {
    const fabric = getFabric(id);
    if (fabric !== undefined && fabric.kind === kind) total += 1;
  }
  return total;
}

/** How many lengths of each kind the box still has room for. */
export function remaining(
  selection: readonly string[],
  box: BoxTier,
): SlotRemaining {
  const capacity = capacitySplit(box);
  const usedShirting = countKind(selection, "shirting");
  const usedSuiting = countKind(selection, "suiting");

  // "Any" slots absorb whichever kind overflows its own slots first.
  const overflowShirting = Math.max(0, usedShirting - capacity.shirting);
  const overflowSuiting = Math.max(0, usedSuiting - capacity.suiting);
  const freeAny = Math.max(0, capacity.any - overflowShirting - overflowSuiting);

  return {
    shirting: Math.max(0, capacity.shirting - usedShirting) + freeAny,
    suiting: Math.max(0, capacity.suiting - usedSuiting) + freeAny,
  };
}

/** True when the fabric could be added to the selection inside this box. */
export function canAdd(
  fabric: Fabric,
  selection: readonly string[],
  box: BoxTier,
): boolean {
  if (selection.includes(fabric.id)) return false;
  const room = remaining(selection, box);
  return fabric.kind === "shirting" ? room.shirting > 0 : room.suiting > 0;
}

/** The box's slot rule in plain words: "Pick 1 suiting and 1 shirting". */
export function ruleString(box: BoxTier): string {
  const capacity = capacitySplit(box);
  const parts: string[] = [];
  if (capacity.suiting > 0) parts.push(`${capacity.suiting} suiting`);
  if (capacity.shirting > 0) parts.push(`${capacity.shirting} shirting`);
  if (parts.length === 0) return "Pick a length of his cloth";
  return `Pick ${parts.join(" and ")}`;
}

/**
 * What is still missing before the box is complete, in plain words —
 * "Pick 1 more shirting to continue" — or null when every slot is filled.
 */
export function missingString(
  box: BoxTier,
  selection: readonly string[],
): string | null {
  const room = remaining(selection, box);
  if (room.shirting === 0 && room.suiting === 0) return null;
  const parts: string[] = [];
  if (room.suiting > 0) parts.push(`${room.suiting} more suiting`);
  if (room.shirting > 0) parts.push(`${room.shirting} more shirting`);
  return `Pick ${parts.join(" and ")} to continue`;
}

/**
 * Why a fabric chip cannot be picked right now, for its title — or null when
 * the fabric fits.
 */
export function blockedReason(
  fabric: Fabric,
  selection: readonly string[],
  box: BoxTier,
): string | null {
  if (selection.includes(fabric.id)) return null;
  if (canAdd(fabric, selection, box)) return null;

  const capacity = capacitySplit(box);
  const own = fabric.kind === "shirting" ? capacity.shirting : capacity.suiting;
  if (own === 0) {
    return `${box.name} takes no ${fabric.kind} lengths`;
  }
  return `All ${own} ${fabric.kind} ${own === 1 ? "slot" : "slots"} in ${box.name} are filled`;
}
