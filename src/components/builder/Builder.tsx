"use client";

/**
 * The gift builder: the three-step form on the left, the live preview
 * sticky on the right (desktop). Everything the two columns share — the
 * flying fabric swatches — lives inside one LayoutGroup.
 *
 * "Add to bag" (Magnet + ClickSpark) is disabled until a box is chosen and
 * every slot is filled, with the reason in plain words underneath. Adding a
 * gift ties the ribbon over the preview, adds the line, bumps the badge and
 * opens the bag drawer.
 */

import { useEffect, useState } from "react";
import { LayoutGroup } from "motion/react";

import { SectionShell } from "@/components/sections/SectionShell";
import { ClickSpark } from "@/components/reactbits/ClickSpark";
import { Magnet } from "@/components/reactbits/Magnet";
import { getBox, isSelectionComplete } from "@/lib/data";
import { missingString } from "@/lib/slots";
import { useGiftStore } from "@/store/gift";

import { PreviewBox } from "./PreviewBox";
import { StepBox } from "./StepBox";
import { StepFabrics } from "./StepFabrics";
import { StepNote } from "./StepNote";

export function Builder() {
  const selectedBox = useGiftStore((state) => state.selectedBox);
  const selectedFabrics = useGiftStore((state) => state.selectedFabrics);
  const addToBag = useGiftStore((state) => state.addToBag);
  const openBag = useGiftStore((state) => state.openBag);

  const [ribbonTied, setRibbonTied] = useState(false);

  const box = getBox(selectedBox);
  const complete =
    box !== undefined && isSelectionComplete(box, selectedFabrics);
  const reason =
    box === undefined
      ? "Choose a box to continue"
      : missingString(box, selectedFabrics);

  // A new box or a new selection means the old ribbon no longer applies.
  useEffect(() => {
    setRibbonTied(false);
  }, [selectedBox, selectedFabrics]);

  const handleAddToBag = () => {
    if (!complete) return;
    const lineId = addToBag();
    if (lineId === null) return;
    setRibbonTied(true);
    openBag();
  };

  return (
    <SectionShell
      id="builder"
      heading="Build the gift"
      intro="Pick an occasion, a box and the cloth. We tie the ribbon and write the note card in your words."
    >
      <LayoutGroup>
        <div className="grid grid-cols-12 gap-y-14 lg:gap-x-10">
          <div className="col-span-12 flex flex-col gap-14 lg:col-span-7">
            <StepBox />
            <StepFabrics />
            <StepNote />

            <div className="flex flex-col items-start gap-3">
              <Magnet>
                <ClickSpark>
                  <button
                    type="button"
                    disabled={!complete}
                    onClick={handleAddToBag}
                    className="inline-flex h-14 items-center rounded-pill bg-red px-9 text-[1.0625rem] font-semibold text-white transition-opacity duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Add to bag
                  </button>
                </ClickSpark>
              </Magnet>
              {reason !== null ? (
                <p role="status" className="text-[0.9375rem] text-chalk">
                  {reason}
                </p>
              ) : null}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <PreviewBox ribbonTied={ribbonTied} />
            </div>
          </div>
        </div>
      </LayoutGroup>
    </SectionShell>
  );
}
