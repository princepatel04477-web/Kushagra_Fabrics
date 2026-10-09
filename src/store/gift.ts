import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

/**
 * Gift builder + bag store.
 * Only the bag is persisted (localStorage), wrapped so that SSR
 * prerender and private-mode browsers never throw.
 */

export interface NoteDraft {
  to: string;
  from: string;
  message: string;
}

export interface BagLine {
  id: string;
  boxId: string;
  fabricIds: string[];
  note: NoteDraft;
  /** Final line price in integer rupees. */
  priceInr: number;
  addedAt: number;
}

export interface GiftState {
  selectedOccasion: string | null;
  selectedBox: string | null;
  selectedFabrics: string[];
  note: NoteDraft;
  bag: BagLine[];

  selectOccasion: (occasionId: string | null) => void;
  selectBox: (boxId: string | null) => void;
  toggleFabric: (fabricId: string) => void;
  clearFabrics: () => void;
  setNote: (patch: Partial<NoteDraft>) => void;
  addLineToBag: (line: Omit<BagLine, "id" | "addedAt">) => void;
  removeLine: (lineId: string) => void;
  clearBag: () => void;
}

const emptyNote: NoteDraft = { to: "", from: "", message: "" };

/** localStorage wrapper: never throws in SSR or private mode. */
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      if (typeof window === "undefined") return null;
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(name, value);
    } catch {
      /* private mode / quota — bag simply stays in memory */
    }
  },
  removeItem: (name) => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.removeItem(name);
    } catch {
      /* noop */
    }
  },
};

function makeLineId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `line-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export const useGiftStore = create<GiftState>()(
  persist(
    (set) => ({
      selectedOccasion: null,
      selectedBox: null,
      selectedFabrics: [],
      note: { ...emptyNote },
      bag: [],

      selectOccasion: (occasionId) => set({ selectedOccasion: occasionId }),

      selectBox: (boxId) => set({ selectedBox: boxId }),

      toggleFabric: (fabricId) =>
        set((state) => ({
          selectedFabrics: state.selectedFabrics.includes(fabricId)
            ? state.selectedFabrics.filter((id) => id !== fabricId)
            : [...state.selectedFabrics, fabricId],
        })),

      clearFabrics: () => set({ selectedFabrics: [] }),

      setNote: (patch) =>
        set((state) => ({ note: { ...state.note, ...patch } })),

      addLineToBag: (line) =>
        set((state) => ({
          bag: [
            ...state.bag,
            { ...line, id: makeLineId(), addedAt: Date.now() },
          ],
        })),

      removeLine: (lineId) =>
        set((state) => ({
          bag: state.bag.filter((line) => line.id !== lineId),
        })),

      clearBag: () => set({ bag: [] }),
    }),
    {
      name: "kushagra-gift-bag",
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ bag: state.bag }),
    },
  ),
);

/** Selector: total number of boxes in the bag. */
export function selectBagCount(state: GiftState): number {
  return state.bag.length;
}
