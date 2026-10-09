"use client";

import { useSmoothScroll } from "@/components/providers/SmoothScroll";

/** Hero call-to-action pair: one solid suiting pill and one quiet link. */
export function HeroActions() {
  const { scrollTo } = useSmoothScroll();
  return (
    <div className="flex flex-wrap items-center gap-5">
      <button
        type="button"
        onClick={() => scrollTo("builder")}
        className="h-12 rounded-pill bg-suiting px-7 text-[15px] font-semibold text-shirting transition-opacity duration-200 hover:opacity-90"
      >
        Build a gift
      </button>
      <button
        type="button"
        onClick={() => scrollTo("boxes")}
        className="text-[15px] font-medium text-suiting underline decoration-line underline-offset-8 transition-colors duration-200 hover:decoration-suiting"
      >
        See the boxes
      </button>
    </div>
  );
}
