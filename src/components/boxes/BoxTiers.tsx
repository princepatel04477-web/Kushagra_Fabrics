"use client";

/**
 * The box tiers: three TiltedCards in an asymmetric row — the middle card
 * taller and raised. Choosing a box stores it and opens /build.
 */

import { GiftBox } from "@/components/boxes/GiftBox";
import { SectionShell } from "@/components/sections/SectionShell";
import { TiltedCard } from "@/components/reactbits/TiltedCard";
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
    >
      <div className="grid items-start gap-6 md:grid-cols-3">
        {boxes.map((box, index) => {
          const selected = box.id === selectedBox;
          const middle = index === 1;

          return (
            <TiltedCard key={box.id} className={cn(middle && "md:-mt-8")}>
              <article
                className={cn(
                  "flex h-full flex-col gap-5 rounded-m border bg-paper p-6",
                  middle ? "md:py-12" : "md:py-8",
                  selected ? "border-suiting" : "border-line",
                )}
              >
                <GiftBox size="sm" stage="open" />

                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-suiting">{box.name}</h3>
                  <span data-numeric className="shrink-0 text-[1rem] text-chalk">
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

                <button
                  type="button"
                  aria-pressed={selected ? "true" : undefined}
                  onClick={() => handleChoose(box.id)}
                  className={cn(
                    "mt-auto inline-flex h-12 items-center justify-center rounded-pill px-7 text-[1rem] font-semibold transition-colors duration-300",
                    selected
                      ? "bg-suiting text-shirting"
                      : "border border-line text-suiting hover:bg-suiting hover:text-shirting",
                  )}
                >
                  {selected ? "Chosen" : "Choose this box"}
                </button>
              </article>
            </TiltedCard>
          );
        })}
      </div>
    </SectionShell>
  );
}
