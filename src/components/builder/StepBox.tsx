"use client";

/**
 * Step 1 of the builder: the box, as a radio group styled as cards and
 * preselected from the store. Choosing a box trims any fabrics that no
 * longer fit and says so in a polite live region.
 */

import { useState } from "react";

import { FabricTrio } from "@/components/boxes/FabricTrio";
import { boxes } from "@/lib/data";
import { formatINR } from "@/lib/format";
import { useGiftStore } from "@/store/gift";
import { cn } from "@/lib/cn";

export function StepBox() {
  const selectedBox = useGiftStore((state) => state.selectedBox);
  const setBox = useGiftStore((state) => state.setBox);
  const [notice, setNotice] = useState<string | null>(null);

  const handleChoose = (id: string) => {
    const before = useGiftStore.getState().selectedFabrics;
    setBox(id);
    const after = useGiftStore.getState().selectedFabrics;
    setNotice(
      after.length < before.length
        ? "Some fabrics were removed — the new box has fewer slots."
        : null,
    );
  };

  return (
    <fieldset
      aria-labelledby="step-box-heading"
      className="m-0 flex flex-col gap-5 border-0 p-0"
    >
      <legend
        id="step-box-heading"
        className="mb-5 font-display text-[1.75rem] leading-[1.08] tracking-[-0.02em] text-suiting"
      >
        1 · Choose the box
      </legend>

      <div
        role="radiogroup"
        aria-label="Choose the box"
        className="grid gap-4 sm:grid-cols-3"
      >
        {boxes.map((box) => {
          const selected = box.id === selectedBox;
          return (
            <label
              key={box.id}
              className={cn(
                "flex cursor-pointer flex-col gap-3 rounded-m border bg-paper p-5 transition-colors duration-300",
                "has-[input:checked]:border-suiting",
                "has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-suiting has-[input:focus-visible]:outline-offset-3",
                selected ? "border-suiting" : "border-line",
              )}
            >
              <input
                type="radio"
                name="kushagra-box"
                value={box.id}
                checked={selected}
                onChange={() => handleChoose(box.id)}
                className="sr-only"
              />
              <FabricTrio ids={box.preview} size={64} />
              <span className="flex flex-col gap-1">
                <span className="font-display text-[1.5rem] leading-[1.05] tracking-[-0.02em] text-suiting">
                  {box.name}
                </span>
                <span data-numeric className="text-[0.9375rem] text-chalk">
                  {formatINR(box.priceInr)}
                </span>
              </span>
              <span className="text-[0.9375rem] text-chalk">{box.line}</span>
              {selected ? (
                <span className="self-start rounded-pill border border-line px-3 py-1 text-[0.8125rem] font-medium text-chalk">
                  Chosen
                </span>
              ) : null}
            </label>
          );
        })}
      </div>

      <p role="status" className="min-h-[1.5em] text-[0.9375rem] text-chalk">
        {notice ?? ""}
      </p>
    </fieldset>
  );
}
