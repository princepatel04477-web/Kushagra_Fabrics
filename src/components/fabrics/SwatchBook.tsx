"use client";

/**
 * The swatch book section: a draggable pile of the eight cloths on the left
 * (six columns), the details panel for the top swatch on the right (five
 * columns, offset by one). "Use in my box" adds the cloth and opens /build. On hover-capable devices the top swatch carries a
 * light sheen (GlareHover) and a magnifying weave lens follows the cursor.
 */

import { useRef, useState } from "react";

import { SectionShell } from "@/components/sections/SectionShell";
import { GlareHover } from "@/components/reactbits/GlareHover";
import { Stack, type StackItem } from "@/components/reactbits/Stack";
import { fabrics } from "@/lib/data";
import { useNavigate } from "@/lib/useNavigate";
import { useGiftStore } from "@/store/gift";

import { FabricTexture } from "./FabricTexture";
import { SwatchDetails } from "./SwatchDetails";
import { WeaveLens } from "./WeaveLens";

interface SectionProps {
  /** 1 on its own route, 2 when it sits inside another page. */
  readonly headingLevel?: 1 | 2;
}

export function SwatchBook({ headingLevel }: SectionProps) {
  const addFabric = useGiftStore((state) => state.addFabric);
  const navigate = useNavigate();
  const [topIndex, setTopIndex] = useState(0);
  const pileRef = useRef<HTMLDivElement | null>(null);

  const topFabric = fabrics[topIndex];
  if (topFabric === undefined) return null;

  const stackItems: readonly StackItem[] = fabrics.map((fabric) => ({
    label: fabric.name,
    node: (
      <GlareHover>
        <FabricTexture fabric={fabric} />
      </GlareHover>
    ),
  }));

  const handleUse = (id: string) => {
    addFabric(id);
    navigate("/build");
  };

  return (
    <SectionShell
      id="fabrics"
      heading="Feel the fabric"
      headingLevel={headingLevel}
      intro="Eight cloths we'd wear ourselves. Drag through them like a tailor's swatch book."
    >
      <div className="grid grid-cols-12 items-start gap-y-12">
        <div className="col-span-12 lg:col-span-6">
          <Stack
            items={stackItems}
            onTopChange={setTopIndex}
            pileRef={pileRef}
            pileOverlay={
              <WeaveLens fabric={topFabric} targetRef={pileRef} />
            }
          />
        </div>
        <div className="col-span-12 lg:col-span-5 lg:col-start-8">
          <SwatchDetails fabric={topFabric} onUse={handleUse} />
        </div>
      </div>
    </SectionShell>
  );
}
