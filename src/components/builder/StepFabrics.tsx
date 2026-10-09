"use client";

/**
 * Step 2 of the builder: a chip for each of the eight fabrics. Slot logic
 * comes from src/lib/slots.ts — chips that no longer fit the box are marked
 * aria-disabled with a title saying why. The chip's 40px photograph carries
 * the shared layoutId while the fabric is unpicked, so picking it flies the
 * cloth into the gift summary (and back out again on deselect).
 */

function Thumb({ fabric }: { readonly fabric: Fabric }) {
  return (
    <Image
      src={fabric.image}
      alt=""
      fill
      sizes="40px"
      className="object-cover"
    />
  );
}

import Image from "next/image";
import { motion } from "motion/react";

import {
  boxCapacityFor,
  boxSlotCount,
  fabrics,
  getBox,
  type Fabric,
} from "@/lib/data";
import { blockedReason, remaining, ruleString } from "@/lib/slots";
import { useGiftStore } from "@/store/gift";
import { cn } from "@/lib/cn";

export function StepFabrics() {
  const selectedBox = useGiftStore((state) => state.selectedBox);
  const selectedFabrics = useGiftStore((state) => state.selectedFabrics);
  const toggleFabric = useGiftStore((state) => state.toggleFabric);

  const box = getBox(selectedBox);

  if (box === undefined) {
    return (
      <section
        aria-labelledby="step-fabrics-heading"
        className="flex flex-col gap-4"
      >
        <h3 id="step-fabrics-heading">2 · Choose the fabrics</h3>
        <p className="text-[0.9375rem] text-chalk">
          Choose a box first — then pick the cloths that fit inside it.
        </p>
      </section>
    );
  }

  const room = remaining(selectedFabrics, box);
  const totalSlotsLeft = Math.max(0, boxSlotCount(box) - selectedFabrics.length);

  const slotBreakdownParts: string[] = [];
  if (boxCapacityFor(box, "shirting") > 0) {
    slotBreakdownParts.push(`${room.shirting} shirting`);
  }
  if (boxCapacityFor(box, "suiting") > 0) {
    slotBreakdownParts.push(`${room.suiting} suiting`);
  }

  return (
    <section
      aria-labelledby="step-fabrics-heading"
      className="flex flex-col gap-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 id="step-fabrics-heading">2 · Choose the fabrics</h3>
        <p className="text-[0.9375rem] text-chalk">{ruleString(box)}</p>
      </div>

      <p className="text-[0.9375rem] text-chalk">
        {totalSlotsLeft === 0
          ? `All slots filled in ${box.name}`
          : `${slotBreakdownParts.join(" and ")} ${
              totalSlotsLeft === 1 ? "slot" : "slots"
            } left in ${box.name}`}
      </p>

      <ul className="flex flex-wrap gap-3">
        {fabrics.map((fabric) => {
          const selected = selectedFabrics.includes(fabric.id);
          const blocked = blockedReason(fabric, selectedFabrics, box);
          const disabled = blocked !== null;

          return (
            <li key={fabric.id}>
              <button
                type="button"
                aria-disabled={disabled ? "true" : undefined}
                aria-pressed={selected ? "true" : undefined}
                title={blocked ?? undefined}
                onClick={() => {
                  if (disabled) return;
                  toggleFabric(fabric.id);
                }}
                className={cn(
                  "flex items-center gap-3 rounded-pill border py-2 pl-2 pr-4 text-left transition-colors duration-300",
                  selected
                    ? "border-suiting bg-suiting text-shirting"
                    : "border-line bg-paper text-suiting hover:border-suiting",
                  disabled && "cursor-not-allowed opacity-45 hover:border-line",
                )}
              >
                {selected ? (
                  <span
                    aria-hidden="true"
                    className="relative h-10 w-10 shrink-0 overflow-hidden rounded-s ring-2 ring-shirting"
                  >
                    <Thumb fabric={fabric} />
                  </span>
                ) : (
                  <motion.span
                    layoutId={`fabric-${fabric.id}`}
                    aria-hidden="true"
                    className="relative h-10 w-10 shrink-0 overflow-hidden rounded-s"
                  >
                    <Thumb fabric={fabric} />
                  </motion.span>
                )}
                <span className="flex flex-col">
                  <span className="text-[0.9375rem] font-medium">
                    {fabric.name}
                  </span>
                  <span
                    className={cn(
                      "text-[0.8125rem]",
                      selected ? "text-shirting/70" : "text-chalk",
                    )}
                  >
                    {fabric.composition}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
