"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { cn } from "@/lib/cn";
import { selectBagCount, useGiftStore } from "@/store/gift";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { PillNav, type PillNavItem } from "@/components/reactbits/PillNav";
import { MobileMenu } from "@/components/chrome/MobileMenu";

const NAV_ITEMS: readonly PillNavItem[] = [
  { label: "Occasions", href: "#occasions" },
  { label: "Fabrics", href: "#fabrics" },
  { label: "Boxes", href: "#boxes" },
  { label: "Corporate", href: "#corporate" },
] as const;

/**
 * Fixed centred pill bar, 20px from the top. The React Bits PillNav owns
 * the sliding highlight between the centre links; motion owns the bar
 * hide/show on scroll and the bag badge bump.
 */
export function Nav() {
  const { scrollTo } = useSmoothScroll();
  const bagCount = useGiftStore(selectBagCount);
  const [hidden, setHidden] = useState(false);
  const [compact, setCompact] = useState(false);
  const lastY = useRef(0);
  const { scrollY } = useScroll();
  const badgeBump = useAnimationControls();
  const previousCount = useRef(bagCount);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastY.current;
    const delta = latest - previous;
    lastY.current = latest;
    setCompact(latest > 120);
    if (latest < 40) {
      setHidden(false);
      return;
    }
    if (delta > 6) setHidden(true);
    else if (delta < -6) setHidden(false);
  });

  useEffect(() => {
    if (bagCount > previousCount.current) {
      void badgeBump.start({
        scale: [1, 1.3, 1],
        transition: { duration: 0.4, ease: "easeOut" },
      });
    }
    previousCount.current = bagCount;
  }, [bagCount, badgeBump]);

  const navigate = (href: string) => scrollTo(href.replace("#", ""));

  return (
    <motion.header
      className="pointer-events-none fixed inset-x-0 top-5 z-50 flex justify-center px-4"
      initial={{ y: "0%", opacity: 1 }}
      animate={{ y: hidden ? "-160%" : "0%", opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={cn(
          "pointer-events-auto flex items-center gap-1 rounded-pill border border-line bg-paper/85 p-2 backdrop-blur-[14px] transition-transform duration-300",
          compact ? "scale-[0.94]" : "scale-100",
        )}
        style={{ transitionTimingFunction: "var(--ease-tailor)" }}
      >
        <a
          href="#top"
          aria-label="Kushagra, back to top"
          onClick={(event) => {
            event.preventDefault();
            scrollTo("top");
          }}
          className="flex items-center rounded-pill px-2 py-1"
        >
          <Image
            src="/brand/kushagra-logo.png"
            alt="Kushagra"
            width={1408}
            height={768}
            priority
            sizes="66px"
            className="h-9 w-auto"
          />
        </a>

        <div className="hidden min-[900px]:block">
          <PillNav items={NAV_ITEMS} onNavigate={navigate} />
        </div>

        <div className="hidden items-center gap-2 min-[900px]:flex">
          <button
            type="button"
            aria-label={`Your bag, ${bagCount} ${bagCount === 1 ? "box" : "boxes"}`}
            onClick={() => scrollTo("builder")}
            className="relative flex h-10 w-10 items-center justify-center rounded-pill text-suiting transition-colors duration-200 hover:bg-suiting/5"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 8h12l-1.2 12.2a1.8 1.8 0 0 1-1.8 1.6H9a1.8 1.8 0 0 1-1.8-1.6L6 8Z" />
              <path d="M9 10V6a3 3 0 0 1 6 0v4" />
            </svg>
            <AnimatePresence>
              {bagCount > 0 && (
                <motion.span
                  key="bag-badge"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="tnum absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-pill bg-red px-1 text-[11px] font-semibold text-white"
                >
                  <motion.span animate={badgeBump} className="tnum block">
                    {bagCount}
                  </motion.span>
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button
            type="button"
            onClick={() => scrollTo("builder")}
            className="h-10 rounded-pill bg-red px-5 text-[15px] font-semibold text-white transition-opacity duration-200 hover:opacity-90"
          >
            Build a gift
          </button>
        </div>

        <MobileMenu />
      </div>
    </motion.header>
  );
}
