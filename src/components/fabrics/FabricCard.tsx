"use client";

/**
 * One cloth: its photograph (4:5), kind and price, name, the spec line his
 * tailor needs, how it wears, and one action — "Add to a box", which puts the
 * cloth in the draft gift and opens /build. Used by the home page's "The
 * cloth" row and the /fabrics grid.
 */

import Image from "next/image";

import { cn } from "@/lib/cn";
import type { Fabric } from "@/lib/data";
import { formatINR } from "@/lib/format";
import { useNavigate } from "@/lib/useNavigate";
import { useGiftStore } from "@/store/gift";

export interface FabricCardProps {
  readonly fabric: Fabric;
  readonly className?: string;
  /** Hint for next/image; defaults to a four-up desktop grid. */
  readonly sizes?: string;
}

const DEFAULT_SIZES = "(min-width: 1100px) 300px, (min-width: 900px) 30vw, 46vw";

/** "100% cotton · 2/40s · 1.6 m shirt length" */
function specLine(fabric: Fabric): string {
  const spec = fabric.count ?? fabric.weight;
  return [
    fabric.composition,
    spec,
    `${fabric.lengthM} m ${fabric.lengthLabel} length`,
  ]
    .filter((part): part is string => part !== null)
    .join(" · ");
}

export function FabricCard({ fabric, className, sizes }: FabricCardProps) {
  const addFabric = useGiftStore((state) => state.addFabric);
  const navigate = useNavigate();

  const handleAdd = () => {
    addFabric(fabric.id);
    navigate("/build");
  };

  return (
    <article
      aria-labelledby={`fabric-${fabric.id}-name`}
      className={cn("group flex h-full flex-col", className)}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-m border border-line bg-paper">
        <Image
          src={fabric.image}
          alt={`${fabric.name}, folded`}
          fill
          sizes={sizes ?? DEFAULT_SIZES}
          placeholder="blur"
          className="object-cover ease-tailor motion-safe:transition-transform motion-safe:duration-[600ms] motion-safe:group-hover:scale-[1.03]"
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="rounded-pill border border-line px-3 py-0.5 text-[0.8125rem] font-medium text-chalk">
          {fabric.kind === "suiting" ? "Suiting" : "Shirting"}
        </span>
        <span data-numeric className="text-[0.9375rem] text-chalk">
          {formatINR(fabric.priceInr)}
        </span>
      </div>

      <h3
        id={`fabric-${fabric.id}-name`}
        className="mt-3 font-display text-2xl leading-[1.08] text-suiting"
      >
        {fabric.name}
      </h3>
      <p data-numeric className="mt-2 text-[0.9375rem] leading-snug text-chalk">
        {specLine(fabric)}
      </p>
      <p className="mt-2 text-[0.9375rem] leading-snug text-chalk">
        {fabric.wear}
      </p>

      <div className="mt-auto pt-5">
        <button type="button" onClick={handleAdd} className="btn-outline">
          Add to a box
          <span className="sr-only">: {fabric.name}</span>
        </button>
      </div>
    </article>
  );
}
