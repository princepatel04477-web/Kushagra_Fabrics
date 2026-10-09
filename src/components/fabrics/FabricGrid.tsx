"use client";

/**
 * The /fabrics page body: a three-way filter (All, Shirting, Suiting) over a
 * grid of FabricCards — four columns from 1100px, three from 900px, two
 * below. The active filter pill slides between options (motion layoutId);
 * cards that stay in the set glide to their new place and the rest fade out.
 * Opacity and scale only.
 */

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { SectionShell } from "@/components/sections/SectionShell";
import { cn } from "@/lib/cn";
import { fabrics, type FabricKind } from "@/lib/data";
import { easeTailorBezier } from "@/lib/tokens";

import { FabricCard } from "./FabricCard";

type Filter = "all" | FabricKind;

const FILTERS: readonly { readonly value: Filter; readonly label: string }[] = [
  { value: "all", label: "All" },
  { value: "shirting", label: "Shirting" },
  { value: "suiting", label: "Suiting" },
];

interface SectionProps {
  /** 1 on its own route, 2 when it sits inside another page. */
  readonly headingLevel?: 1 | 2;
}

export function FabricGrid({ headingLevel }: SectionProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const shown = fabrics.filter(
    (fabric) => filter === "all" || fabric.kind === filter,
  );

  return (
    <SectionShell
      id="fabrics"
      heading="The cloth"
      headingLevel={headingLevel}
      intro="Eight cloths we would wear ourselves. Every length is cut to measure for one garment."
      contentClassName="mt-10"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div
          role="radiogroup"
          aria-label="Filter the cloth"
          className="flex w-fit gap-1 rounded-pill border border-line bg-paper p-1"
        >
          {FILTERS.map((option) => {
            const active = option.value === filter;
            return (
              <label
                key={option.value}
                className="relative cursor-pointer rounded-pill has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-[3px] has-[input:focus-visible]:outline-suiting"
              >
                <input
                  type="radio"
                  name="fabric-filter"
                  value={option.value}
                  checked={active}
                  onChange={() => setFilter(option.value)}
                  className="sr-only"
                />
                {active ? (
                  <motion.span
                    layoutId="fabric-filter-pill"
                    aria-hidden="true"
                    transition={{ duration: 0.4, ease: easeTailorBezier }}
                    className="absolute inset-0 rounded-pill bg-suiting"
                  />
                ) : null}
                <span
                  className={cn(
                    "relative block px-5 py-2 text-[0.9375rem] font-medium transition-colors duration-300",
                    active ? "text-shirting" : "text-suiting",
                  )}
                >
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>

        <p role="status" data-numeric className="text-[0.9375rem] text-chalk">
          {shown.length} {shown.length === 1 ? "cloth" : "cloths"}
        </p>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 min-[900px]:grid-cols-3 min-[900px]:gap-x-6 min-[1100px]:grid-cols-4">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((fabric) => (
            <motion.li
              key={fabric.id}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, ease: easeTailorBezier }}
            >
              <FabricCard fabric={fabric} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </SectionShell>
  );
}
