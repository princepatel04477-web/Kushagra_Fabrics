"use client";

/**
 * The details panel beside the swatch pile: the top swatch's name in Bodoni
 * Moda, its spec rows (composition, count or weight, length), the wear line,
 * and the one primary action — "Use in my box". Crossfades when the top
 * swatch changes.
 */

import { AnimatePresence, motion } from "motion/react";

import { formatINR } from "@/lib/format";
import type { Fabric } from "@/lib/data";
import { easeTailorBezier } from "@/lib/tokens";

export interface SwatchDetailsProps {
  readonly fabric: Fabric;
  readonly onUse: (id: string) => void;
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function SwatchDetails({ fabric, onUse }: SwatchDetailsProps) {
  const spec = fabric.count ?? fabric.weight;

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={fabric.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.35, ease: easeTailorBezier }}
          className="flex flex-col items-start gap-6"
        >
          <div className="flex items-center gap-3">
            <span className="rounded-pill border border-line px-3 py-1 font-body text-[0.8125rem] font-medium text-chalk">
              {fabric.kind === "suiting" ? "Suiting" : "Shirting"}
            </span>
            <span data-numeric className="font-body text-[0.9375rem] text-chalk">
              {formatINR(fabric.priceInr)}
            </span>
          </div>

          <h3 className="text-suiting">{fabric.name}</h3>

          <dl className="w-full">
            <div className="flex items-baseline justify-between gap-6 border-t border-line py-3">
              <dt className="font-body text-[0.9375rem] text-chalk">Composition</dt>
              <dd className="font-body text-[0.9375rem] font-medium text-suiting">
                {fabric.composition}
              </dd>
            </div>
            {spec !== null ? (
              <div className="flex items-baseline justify-between gap-6 border-t border-line py-3">
                <dt className="font-body text-[0.9375rem] text-chalk">
                  {fabric.count !== null ? "Count" : "Weight"}
                </dt>
                <dd
                  data-numeric
                  className="font-body text-[0.9375rem] font-medium text-suiting"
                >
                  {spec}
                </dd>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between gap-6 border-t border-line py-3">
              <dt className="font-body text-[0.9375rem] text-chalk">Length</dt>
              <dd
                data-numeric
                className="font-body text-[0.9375rem] font-medium text-suiting"
              >
                {capitalise(fabric.lengthLabel)} length · {fabric.lengthM} m
              </dd>
            </div>
          </dl>

          <p className="max-w-[44ch] font-body text-[1.0625rem] text-chalk">
            {fabric.wear}
          </p>

          <button
            type="button"
            onClick={() => onUse(fabric.id)}
            className="inline-flex h-12 items-center rounded-pill bg-red-deep px-7 font-body text-[1rem] font-semibold text-white transition-opacity duration-300 hover:opacity-90"
          >
            Use in my box
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
