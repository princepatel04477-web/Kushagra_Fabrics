"use client";

import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

import {
  fitSelection,
  getBox,
  isSelectionComplete,
  selectionPriceInr,
} from "@/lib/data";

/**
 * The gift being built, plus the bag.
 *
 * Only the bag is persisted. Everything else is a draft and should be lost on
 * reload. Hydration is deferred (`skipHydration`) so the first client render
 * matches the server render exactly — a persisted bag count appearing during
 * hydration would be a mismatch.
 */

const STORAGE_KEY = "kushagra-bag";
const STORAGE_VERSION = 1;

/** How many lengths may be picked before a box has been chosen. */
const MAX_FABRICS_BEFORE_BOX = 3;

const MAX_LINE_QTY = 20;

/* ------------------------------------------------------------------ types -- */

export interface GiftNote {
  readonly to: string;
  readonly from: string;
  readonly message: string;
}

export interface BagLine {
  readonly id: string;
  readonly boxId: string;
  readonly occasionId: string | null;
  readonly fabricIds: readonly string[];
  readonly note: GiftNote;
  readonly qty: number;
  /** Box + fabric price, snapshotted when the line was added. */
  readonly unitPriceInr: number;
  readonly createdAt: number;
}

export interface GiftState {
  selectedOccasion: string | null;
  selectedBox: string | null;
  selectedFabrics: string[];
  note: GiftNote;
  lines: BagLine[];
  hydrated: boolean;

  setOccasion: (id: string | null) => void;
  setBox: (id: string | null) => void;
  toggleFabric: (id: string) => void;
  clearFabrics: () => void;
  setNote: (patch: Partial<GiftNote>) => void;
  resetGift: () => void;

  addToBag: () => string | null;
  removeLine: (id: string) => void;
  setLineQty: (id: string, qty: number) => void;
  clearBag: () => void;

  markHydrated: () => void;
}

/* -------------------------------------------------------------- utilities -- */

const emptyNote: GiftNote = { to: "", from: "", message: "" };

function createLineId(): string {
  const webCrypto = globalThis.crypto;
  if (webCrypto !== undefined && typeof webCrypto.randomUUID === "function") {
    return webCrypto.randomUUID();
  }
  return `line-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function signature(line: {
  boxId: string;
  fabricIds: readonly string[];
  note: GiftNote;
}): string {
  return [
    line.boxId,
    [...line.fabricIds].sort().join("+"),
    line.note.to.trim().toLowerCase(),
    line.note.from.trim().toLowerCase(),
    line.note.message.trim().toLowerCase(),
  ].join("|");
}

/**
 * localStorage access wrapped so server rendering, Safari private mode and
 * disabled storage never throw — they simply behave like an empty store.
 */
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return globalThis.localStorage?.getItem(name) ?? null;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      globalThis.localStorage?.setItem(name, value);
    } catch {
      /* storage unavailable or full — the bag stays in memory only */
    }
  },
  removeItem: (name) => {
    try {
      globalThis.localStorage?.removeItem(name);
    } catch {
      /* nothing to remove */
    }
  },
};

/* ------------------------------------------------------------------ store -- */

type PersistedGift = Pick<GiftState, "lines">;

export const useGiftStore = create<GiftState>()(
  persist<GiftState, [], [], PersistedGift>(
    (set, get) => ({
      selectedOccasion: null,
      selectedBox: null,
      selectedFabrics: [],
      note: emptyNote,
      lines: [],
      hydrated: false,

      setOccasion: (id) => set({ selectedOccasion: id }),

      setBox: (id) =>
        set((state) => {
          const box = getBox(id);
          if (box === undefined) {
            return { selectedBox: id, selectedFabrics: [] };
          }
          return {
            selectedBox: id,
            selectedFabrics: fitSelection(box, state.selectedFabrics),
          };
        }),

      toggleFabric: (id) =>
        set((state) => {
          const current = state.selectedFabrics;

          if (current.includes(id)) {
            return { selectedFabrics: current.filter((fabricId) => fabricId !== id) };
          }

          const withNew = [...current, id];
          const box = getBox(state.selectedBox);

          if (box === undefined) {
            return {
              selectedFabrics: withNew.slice(-MAX_FABRICS_BEFORE_BOX),
            };
          }

          const fitted = fitSelection(box, withNew);
          if (fitted.includes(id)) {
            return { selectedFabrics: fitted };
          }

          // No room, or the wrong kind: drop the earliest pick until it fits.
          let attempt = withNew.slice();
          while (attempt.length > 0) {
            attempt = attempt.slice(1);
            const retry = fitSelection(box, attempt);
            if (retry.includes(id)) {
              return { selectedFabrics: retry };
            }
          }

          return { selectedFabrics: [] };
        }),

      clearFabrics: () => set({ selectedFabrics: [] }),

      setNote: (patch) =>
        set((state) => ({ note: { ...state.note, ...patch } })),

      resetGift: () =>
        set({
          selectedOccasion: null,
          selectedBox: null,
          selectedFabrics: [],
          note: emptyNote,
        }),

      addToBag: () => {
        const state = get();
        const box = getBox(state.selectedBox);
        if (box === undefined) return null;

        const fabricIds = fitSelection(box, state.selectedFabrics);
        if (!isSelectionComplete(box, fabricIds)) return null;

        const note: GiftNote = { ...state.note };
        const candidate = { boxId: box.id, fabricIds, note };
        const match = state.lines.find(
          (line) => signature(line) === signature(candidate),
        );

        if (match !== undefined) {
          set((current) => ({
            lines: current.lines.map((line) =>
              line.id === match.id
                ? { ...line, qty: Math.min(line.qty + 1, MAX_LINE_QTY) }
                : line,
            ),
          }));
          return match.id;
        }

        const line: BagLine = {
          id: createLineId(),
          boxId: box.id,
          occasionId: state.selectedOccasion,
          fabricIds,
          note,
          qty: 1,
          unitPriceInr: selectionPriceInr(box, fabricIds),
          createdAt: Date.now(),
        };

        set((current) => ({ lines: [...current.lines, line] }));
        return line.id;
      },

      removeLine: (id) =>
        set((state) => ({
          lines: state.lines.filter((line) => line.id !== id),
        })),

      setLineQty: (id, qty) =>
        set((state) => {
          if (qty <= 0) {
            return { lines: state.lines.filter((line) => line.id !== id) };
          }
          return {
            lines: state.lines.map((line) =>
              line.id === id
                ? { ...line, qty: Math.min(qty, MAX_LINE_QTY) }
                : line,
            ),
          };
        }),

      clearBag: () => set({ lines: [] }),

      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ lines: state.lines }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);

/* --------------------------------------------------------------- selectors -- */

/** Total number of boxes in the bag, counting quantity. */
export function useBagCount(): number {
  return useGiftStore((state) =>
    state.lines.reduce((total, line) => total + line.qty, 0),
  );
}

/** Total value of the bag, in integer rupees. */
export function useBagTotal(): number {
  return useGiftStore((state) =>
    state.lines.reduce((total, line) => total + line.qty * line.unitPriceInr, 0),
  );
}
