"use client";

/**
 * The gift builder: the three-step form on the left (seven columns), the gift
 * summary sticky on the right (columns 9–12, desktop). Below 900px the
 * summary comes after step 3 and before "Add to bag". Everything the two
 * columns share — the flying fabric thumbnails — lives inside one LayoutGroup.
 *
 * "Add to bag" (ClickSpark) is disabled until a box is chosen and every slot
 * is filled, with the reason in plain words underneath. Adding a gift adds
 * the line, bumps the badge and opens the bag drawer.
 */

import { LayoutGroup } from "motion/react";

import { SectionShell } from "@/components/sections/SectionShell";
import { ClickSpark } from "@/components/reactbits/ClickSpark";
import { getBox, isSelectionComplete } from "@/lib/data";
import { missingString } from "@/lib/slots";
import { useGiftStore } from "@/store/gift";

import { GiftSummary } from "./GiftSummary";
import { StepBox } from "./StepBox";
import { StepFabrics } from "./StepFabrics";
import { StepNote } from "./StepNote";

interface SectionProps {
  /** 1 on its own route, 2 when it sits inside another page. */
  readonly headingLevel?: 1 | 2;
}

export function Builder({ headingLevel }: SectionProps) {
  const selectedBox = useGiftStore((state) => state.selectedBox);
  const selectedFabrics = useGiftStore((state) => state.selectedFabrics);
  const addToBag = useGiftStore((state) => state.addToBag);
  const openBag = useGiftStore((state) => state.openBag);

  const box = getBox(selectedBox);
  const complete =
    box !== undefined && isSelectionComplete(box, selectedFabrics);
  const reason =
    box === undefined
      ? "Choose a box to continue"
      : missingString(box, selectedFabrics);

  const handleAddToBag = () => {
    if (!complete) return;
    const lineId = addToBag();
    if (lineId === null) return;
    openBag();
  };

  return (
    <SectionShell
      id="builder"
      heading="Build the gift"
      headingLevel={headingLevel}
      intro="Pick an occasion, a box and the cloth. We tie the ribbon and write the note card in your words."
    >
      <LayoutGroup>
        <div className="grid grid-cols-12 gap-y-12 lg:gap-y-14">
          <div className="col-span-12 flex flex-col gap-14 lg:col-span-7 lg:row-start-1">
            <StepBox />
            <StepFabrics />
            <StepNote />
          </div>

          <div className="col-span-12 self-start lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-[120px]">
            <GiftSummary />
          </div>

          <div className="col-span-12 flex flex-col items-start gap-3 lg:col-span-7 lg:row-start-2">
            <ClickSpark>
              <button
                type="button"
                disabled={!complete}
                onClick={handleAddToBag}
                className="btn-primary"
              >
                Add to bag
              </button>
            </ClickSpark>
            {reason !== null ? (
              <p role="status" className="text-[0.9375rem] text-chalk">
                {reason}
              </p>
            ) : null}
          </div>
        </div>
      </LayoutGroup>
    </SectionShell>
  );
}
