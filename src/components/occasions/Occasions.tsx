"use client";

/**
 * The occasions section: one FlowingMenu row per occasion. Choosing one
 * stores it on the draft gift and travels to the builder.
 */

import { SectionShell } from "@/components/sections/SectionShell";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import {
  FlowingMenu,
  type FlowingMenuItem,
} from "@/components/reactbits/FlowingMenu";
import { occasions } from "@/lib/data";
import { useGiftStore } from "@/store/gift";

/**
 * Photo tiles for the marquee band — fabric, tailoring and gift boxes, one
 * set per occasion.
 */
const OCCASION_IMAGES: Readonly<Record<string, readonly string[]>> = {
  "raksha-bandhan": [
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=240&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=240&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=240&auto=format&fit=crop",
  ],
  wedding: [
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=240&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=240&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=240&auto=format&fit=crop",
  ],
  diwali: [
    "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=240&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=240&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=240&auto=format&fit=crop",
  ],
  "fathers-day": [
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=240&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=240&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=240&auto=format&fit=crop",
  ],
  anniversary: [
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=240&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=240&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=240&auto=format&fit=crop",
  ],
  corporate: [
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=240&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=240&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=240&auto=format&fit=crop",
  ],
};

export function Occasions() {
  const setOccasion = useGiftStore((state) => state.setOccasion);
  const selectedOccasion = useGiftStore((state) => state.selectedOccasion);
  const { scrollTo } = useSmoothScroll();

  const items: readonly FlowingMenuItem[] = occasions.map((occasion) => ({
    id: occasion.id,
    text: occasion.name,
    line: occasion.line,
    images: OCCASION_IMAGES[occasion.id] ?? [],
  }));

  const handleSelect = (id: string) => {
    setOccasion(id);
    scrollTo("#builder");
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
