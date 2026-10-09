"use client";

/**
 * The occasions section: one FlowingMenu row per occasion. Choosing one
 * stores it on the draft gift and opens /build.
 */

import type { StaticImageData } from "next/image";

import { SectionShell } from "@/components/sections/SectionShell";
import {
  FlowingMenu,
  type FlowingMenuItem,
} from "@/components/reactbits/FlowingMenu";
import { getFabric, occasions } from "@/lib/data";
import { useNavigate } from "@/lib/useNavigate";
import { useGiftStore } from "@/store/gift";

/**
 * Fabric tiles for the marquee band, three per occasion — our own cloth,
 * shown close up.
 */
const OCCASION_FABRICS: Readonly<Record<string, readonly string[]>> = {
  "raksha-bandhan": ["oxford-white", "bengal-stripe", "sky-end-on-end"],
  wedding: ["bottle-green-velvet", "charcoal-herringbone", "navy-twill"],
  diwali: ["bottle-green-velvet", "ivory-linen", "navy-twill"],
  "fathers-day": ["oxford-white", "sandstone-chino", "charcoal-herringbone"],
  anniversary: ["navy-twill", "sky-end-on-end", "bottle-green-velvet"],
  corporate: ["oxford-white", "sky-end-on-end", "sandstone-chino"],
};

function imagesFor(occasionId: string): StaticImageData[] {
  return (OCCASION_FABRICS[occasionId] ?? [])
    .map((id) => getFabric(id)?.image)
    .filter((image): image is StaticImageData => image !== undefined);
}

export function Occasions() {
  const setOccasion = useGiftStore((state) => state.setOccasion);
  const selectedOccasion = useGiftStore((state) => state.selectedOccasion);
  const navigate = useNavigate();

  const items: readonly FlowingMenuItem[] = occasions.map((occasion) => ({
    id: occasion.id,
    text: occasion.name,
    line: occasion.line,
    images: imagesFor(occasion.id),
  }));

  const handleSelect = (id: string) => {
    setOccasion(id);
    navigate("/build");
  };

  return (
    <SectionShell
      id="occasions"
      heading="Pick the occasion"
      intro="Every box comes with a card written for the day. Choose when he'll open it."
    >
      <FlowingMenu
        items={items}
        selectedId={selectedOccasion}
        onSelect={handleSelect}
      />
    </SectionShell>
  );
}
