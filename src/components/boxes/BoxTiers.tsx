"use client";

/**
 * The box tiers: one banner photograph, then three flat cards in a row
 * (stacked below 900px). Each card shows the cloth it might hold, the price,
 * what arrives, who it is for, and one action — choosing a box stores it and
 * opens /build. No tilt, no raised middle card: the three are equal.
 */

import Image from "next/image";

import boxShirt from "@/assets/photos/box-shirt.jpg";
import { FabricTrio } from "@/components/boxes/FabricTrio";
import { SectionShell } from "@/components/sections/SectionShell";
import { boxes } from "@/lib/data";
import { formatINR } from "@/lib/format";
import { useNavigate } from "@/lib/useNavigate";
import { useGiftStore } from "@/store/gift";
import { cn } from "@/lib/cn";

interface SectionProps {
  /** 1 on its own route, 2 when it sits inside another page. */
  readonly headingLevel?: 1 | 2;
}

export function BoxTiers({ headingLevel }: SectionProps) {
  const selectedBox = useGiftStore((state) => state.selectedBox);
  const setBox = useGiftStore((state) => state.setBox);
  const navigate = useNavigate();

  const handleChoose = (id: string) => {
    setBox(id);
    navigate("/build");
  };

  return (
    <SectionShell
      id="boxes"
      heading="Choose his box"
      headingLevel={headingLevel}
      intro="Every box arrives wrapped, ribboned and ready to hand over."
      contentClassName="mt-10"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-m border border-line bg-paper min-[900px]:aspect-[21/9]">
        <Image
          src={boxShirt}
          alt="A slim navy Kushagra box with a red bow on the lid, beside folded white and Bengal stripe shirt lengths"
          fill
          sizes="(min-width: 1320px) 1192px, 100vw"
          placeholder="blur"
          className="object-cover"
        />
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-6 min-[900px]:grid-cols-3">
        {boxes.map((box) => {
          const selected = box.id === selectedBox;

          return (
            <li key={box.id}>
              <article
                aria-labelledby={`box-${box.id}-name`}
                className={cn(
                  "flex h-full flex-col gap-5 rounded-m border bg-paper p-6",
                  selected ? "border-suiting" : "border-line",
                )}
              >
                <FabricTrio ids={box.preview} size={112} />

                <div className="flex items-baseline justify-between gap-4">
                  <h3 id={`box-${box.id}-name`} className="text-suiting">
                    {box.name}
                  </h3>
                  <span
                    data-numeric
                    className="shrink-0 text-[1rem] text-chalk"
                  >
                    {formatINR(box.priceInr)}
                  </span>
                </div>

                <p className="text-[0.9375rem] text-chalk">{box.line}</p>

                <ul className="flex flex-col">
                  {box.includes.map((item) => (
                    <li
                      key={item}
                      className="border-t border-line py-2 text-[0.9375rem] text-chalk"
                    >
                      {item}
                    </li>
                  ))}
                </ul>

                <p className="text-[0.9375rem] text-chalk">
                  Best for: {box.bestFor}
                </p>

                <button
                  type="button"
                  aria-pressed={selected ? "true" : undefined}
                  onClick={() => handleChoose(box.id)}
                  className={cn(
                    "mt-auto self-start",
                    selected ? "btn-solid" : "btn-outline",
                  )}
                >
                  {selected ? "Chosen" : "Choose this box"}
                </button>
              </article>
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}
