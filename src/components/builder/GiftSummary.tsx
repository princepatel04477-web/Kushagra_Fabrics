"use client";

/**
 * The live summary of the gift: the chosen box and its price, one row per
 * chosen cloth (48px photograph, name, price), a rule, the total, and the
 * note card underneath. Empty slots show as dashed thread rows.
 *
 * Each cloth's thumbnail carries the shared layoutId `fabric-${id}`, so
 * picking a chip in step 2 flies the photograph into this list and
 * deselecting flies it back.
 */

import Image from "next/image";
import { motion } from "motion/react";

import {
  boxSlotCount,
  getBox,
  getFabric,
  getOccasion,
  selectionPriceInr,
  type Fabric,
} from "@/lib/data";
import { formatINR } from "@/lib/format";
import { remaining } from "@/lib/slots";
import { easeTailorBezier } from "@/lib/tokens";
import { useGiftStore } from "@/store/gift";

import { GiftCard } from "./GiftCard";

export function GiftSummary() {
  const selectedBox = useGiftStore((state) => state.selectedBox);
  const selectedFabrics = useGiftStore((state) => state.selectedFabrics);
  const note = useGiftStore((state) => state.note);
  const selectedOccasion = useGiftStore((state) => state.selectedOccasion);

  const box = getBox(selectedBox);
  const occasion = getOccasion(selectedOccasion);

  const chosen = selectedFabrics
    .map((id) => getFabric(id))
    .filter((fabric): fabric is Fabric => fabric !== undefined);

  const emptyLabels: string[] = [];
  if (box !== undefined) {
    const room = remaining(selectedFabrics, box);
    for (let i = 0; i < room.shirting; i += 1) emptyLabels.push("Shirting length");
    for (let i = 0; i < room.suiting; i += 1) emptyLabels.push("Suiting length");
    const slotsLeft = Math.max(0, boxSlotCount(box) - chosen.length);
    while (emptyLabels.length > slotsLeft) emptyLabels.pop();
  }

  return (
    <div className="flex flex-col gap-4">
      <section
        aria-labelledby="gift-summary-heading"
        className="rounded-m border border-line bg-paper p-5"
      >
        <h3 id="gift-summary-heading" className="text-[1.25rem] leading-[1.2]">
          Your gift
        </h3>

        {box !== undefined ? (
          <>
            <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4">
              <span className="font-display text-[1.25rem] leading-[1.1] tracking-[-0.02em] text-suiting">
                {box.name}
              </span>
              <span data-numeric className="shrink-0 text-[0.9375rem] text-chalk">
                {formatINR(box.priceInr)}
              </span>
            </div>

            <ul className="mt-4 flex flex-col gap-3">
              {chosen.map((fabric) => (
                <li key={fabric.id} className="flex items-center gap-3">
                  <motion.span
                    layout
                    layoutId={`fabric-${fabric.id}`}
                    transition={{ duration: 0.7, ease: easeTailorBezier }}
                    aria-hidden="true"
                    className="relative h-12 w-12 shrink-0 overflow-hidden rounded-s border border-line"
                  >
                    <Image
                      src={fabric.image}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </motion.span>
                  <span className="min-w-0 flex-1 text-[0.9375rem] text-suiting">
                    {fabric.name}
                  </span>
                  <span
                    data-numeric
                    className="shrink-0 text-[0.9375rem] text-chalk"
                  >
                    {formatINR(fabric.priceInr)}
                  </span>
                </li>
              ))}
              {emptyLabels.map((label, index) => (
                <li
                  key={`empty-${index}`}
                  className="flex h-12 items-center rounded-s border border-dashed border-thread px-3 text-[0.9375rem] text-chalk"
                >
                  {label}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4">
              <span className="text-[0.9375rem] font-medium text-suiting">Total</span>
              <span data-numeric className="text-[1.125rem] font-medium text-suiting">
                {formatINR(selectionPriceInr(box, selectedFabrics))}
              </span>
            </div>
          </>
        ) : (
          <p className="mt-4 border-t border-line pt-4 text-[0.9375rem] text-chalk">
            Choose a box to price the gift
          </p>
        )}
      </section>

      <GiftCard note={note} occasionName={occasion?.name} />
    </div>
  );
}
