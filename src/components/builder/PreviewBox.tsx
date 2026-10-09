"use client";

/**
 * The live preview: the open box seen slightly from above, with one folded
 * layer per selected fabric (each carrying the shared layoutId
 * `fabric-${id}`, so picking a chip flies the cloth in and deselecting flies
 * it back), dashed thread guides for the empty slots, the gift card on top,
 * and the price underneath. When a gift is added to the bag, a red ribbon
 * ties itself across the box.
 */

import { motion } from "motion/react";

import { GiftBox } from "@/components/boxes/GiftBox";
import { fabricTextureStyle } from "@/components/fabrics/FabricTexture";
import {
  boxSlotCount,
  getBox,
  getFabric,
  getOccasion,
  selectionPriceInr,
} from "@/lib/data";
import { formatINR } from "@/lib/format";
import { useGiftStore } from "@/store/gift";
import { easeTailorBezier } from "@/lib/tokens";

import { GiftCard } from "./GiftCard";

export interface PreviewBoxProps {
  /** True after a gift is added — the ribbon ties across the box. */
  readonly ribbonTied: boolean;
}

export function PreviewBox({ ribbonTied }: PreviewBoxProps) {
  const selectedBox = useGiftStore((state) => state.selectedBox);
  const selectedFabrics = useGiftStore((state) => state.selectedFabrics);
  const note = useGiftStore((state) => state.note);
  const selectedOccasion = useGiftStore((state) => state.selectedOccasion);

  const box = getBox(selectedBox);
  const occasion = getOccasion(selectedOccasion);

  const layers = selectedFabrics
    .map((id) => getFabric(id))
    .filter((fabric) => fabric !== undefined);

  const emptySlots =
    box === undefined ? 0 : Math.max(0, boxSlotCount(box) - layers.length);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-fit">
        <GiftBox stage="open" size="md">
          {layers.map((fabric, index) => (
            <motion.div
              key={fabric.id}
              layout
              layoutId={`fabric-${fabric.id}`}
              transition={{ duration: 0.7, ease: easeTailorBezier }}
              aria-hidden="true"
              className="absolute h-[60%] w-[88%] rounded-s border border-line"
              style={{
                ...fabricTextureStyle(fabric),
                left: `${6 + index * 2}%`,
                top: `${8 + index * 12}%`,
                rotate: `${-2 + index * 2}deg`,
                zIndex: index + 1,
              }}
            />
          ))}
          {Array.from({ length: emptySlots }).map((_, index) => (
            <div
              key={`slot-${index}`}
              aria-hidden="true"
              className="absolute h-[60%] w-[88%] rounded-s border border-dashed opacity-60"
              style={{
                borderColor: "var(--color-thread)",
                left: `${6 + (layers.length + index) * 2}%`,
                top: `${8 + (layers.length + index) * 12}%`,
                rotate: `${-2 + (layers.length + index) * 2}deg`,
              }}
            />
          ))}
        </GiftBox>

        {/* The gift card, on top of the box. */}
        <div className="absolute -right-6 top-2 z-20 sm:-right-10">
          <GiftCard note={note} occasionName={occasion?.name} />
        </div>

        {/* The ribbon, tying itself across the box after a gift is added. */}
        {ribbonTied ? (
          <>
            <motion.div
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, ease: easeTailorBezier }}
              className="absolute left-0 right-0 top-[56%] z-10 h-3 -translate-y-1/2 bg-red"
            />
            <motion.div
              aria-hidden="true"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.5, ease: easeTailorBezier, delay: 0.1 }}
              className="absolute bottom-[8%] top-[10%] left-1/2 z-10 w-3 -translate-x-1/2 bg-red"
            />
            <motion.div
              aria-hidden="true"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.35,
                ease: easeTailorBezier,
                delay: 0.35,
              }}
              className="absolute left-1/2 top-[56%] z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red"
            />
          </>
        ) : null}
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        {box !== undefined ? (
          <>
            <span className="font-display text-[1.25rem] leading-[1.1] tracking-[-0.02em] text-suiting">
              {box.name}
            </span>
            <span data-numeric className="text-[1rem] text-chalk">
              {formatINR(selectionPriceInr(box, selectedFabrics))}
            </span>
          </>
        ) : (
          <span className="text-[0.9375rem] text-chalk">
            Choose a box to price the gift
          </span>
        )}
      </div>
    </div>
  );
}
