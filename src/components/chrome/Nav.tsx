"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimate,
  useMotionValueEvent,
  useScroll,
} from "motion/react";

import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { PillNav, type PillNavItem } from "@/components/reactbits/PillNav";
import { useGiftStore, useBagCount } from "@/store/gift";
import { cn } from "@/lib/cn";
import { duration as tokenDuration, easeTailorBezier, layout } from "@/lib/tokens";

import { BagDrawer } from "../bag/BagDrawer";
import { MobileMenu } from "./MobileMenu";

const NAV_ITEMS: readonly PillNavItem[] = [
  { label: "Occasions", href: "#occasions" },
  { label: "Fabrics", href: "#fabrics" },
  { label: "Boxes", href: "#boxes" },
  { label: "Corporate", href: "#corporate" },
];

/** px of downward scroll per frame that counts as "fast". */
const HIDE_SPEED = 8;
const SHOW_SPEED = -2;

function BagIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4.25 6.5h11.5l-.9 10.1a1.6 1.6 0 0 1-1.6 1.4H6.75a1.6 1.6 0 0 1-1.6-1.4L4.25 6.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 6.5V5a2.5 2.5 0 0 1 5 0v1.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Nav() {
  const { scrollTo, scrollToTop, start } = useSmoothScroll();
  const bagCount = useBagCount();
  const bagOpen = useGiftStore((state) => state.bagOpen);
  const openBag = useGiftStore((state) => state.openBag);

  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const lastScrollY = useRef(0);
  const { scrollY } = useScroll();

  const [badgeScope, animateBadge] = useAnimate<HTMLSpanElement>();
  const previousCount = useRef(bagCount);

  useMotionValueEvent(scrollY, "change", (y) => {
    const delta = y - lastScrollY.current;
    lastScrollY.current = y;

    setCompact(y > layout.navCompactAt);

    if (menuOpen) {
      setHidden(false);
      return;
    }

    if (y <= layout.navCompactAt) {
      setHidden(false);
      return;
    }
    if (delta > HIDE_SPEED) {
      setHidden(true);
    } else if (delta < SHOW_SPEED) {
      setHidden(false);
    }
  });

  useEffect(() => {
    if (bagCount > previousCount.current && previousCount.current > 0) {
      const badge = badgeScope.current;
      if (badge !== null) {
        void animateBadge(
          badge,
          { scale: [1, 1.3, 1] },
          { duration: tokenDuration.bump, ease: "easeOut" },
        );
      }
    }
    previousCount.current = bagCount;
  }, [bagCount, animateBadge, badgeScope]);

  // Every action from the bar: close any open menu, release the scroll lock,
  // then travel. Safe on desktop too, where the menu is never open.
  const handleBarAction = useCallback(
    (href: string) => {
      setMenuOpen(false);
      start();
      scrollTo(href);
    },
    [scrollTo, start],
  );

  const handleBarHome = useCallback(() => {
    setMenuOpen(false);
    start();
    scrollToTop();
  }, [scrollToTop, start]);

  const bagLabel =
    bagCount === 1 ? "Bag, 1 box" : `Bag, ${bagCount} boxes`;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[130] flex justify-center px-4"
      style={{ top: layout.navTop }}
    >
      <motion.nav
        data-nav-bar
        aria-label="Main"
        animate={{ y: hidden && !menuOpen ? -160 : 0 }}
        transition={{ duration: tokenDuration.nav, ease: easeTailorBezier }}
        className={cn(
          "pointer-events-auto flex w-full max-w-[1120px] items-center gap-3 rounded-pill",
          "border border-line bg-paper/85 px-3 backdrop-blur-[14px]",
          "transition-[height,padding] duration-500 ease-tailor",
          compact ? "h-14" : "h-[72px]",
        )}
      >
        <button
          type="button"
          onClick={handleBarHome}
          aria-label="Kushagra — back to top"
          className="flex shrink-0 items-center gap-2 rounded-pill pl-1 pr-1"
        >
          <span className="relative block h-9 w-[30px]">
            <Image
              src="/brand/kushagra-mark.png"
              alt=""
              width={30}
              height={36}
              priority
              className="h-9 w-[30px]"
            />
          </span>
          <span className="hidden font-display text-[1.35rem] leading-none tracking-[-0.02em] text-suiting sm:block">
            Kushagra
          </span>
        </button>

        <div className="hidden flex-1 justify-center min-[900px]:flex">
          <PillNav items={NAV_ITEMS} onNavigate={handleBarAction} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            data-bag-button
            onClick={openBag}
            aria-label={bagLabel}
            aria-haspopup="dialog"
            aria-expanded={bagOpen ? "true" : undefined}
            className="relative grid h-10 w-10 shrink-0 place-items-center rounded-pill border border-line text-suiting transition-colors duration-300 hover:bg-suiting hover:text-shirting"
          >
            <BagIcon />
            <AnimatePresence>
              {bagCount > 0 ? (
                <motion.span
                  key="bag-badge"
                  ref={badgeScope}
                  data-numeric
                  aria-hidden="true"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: easeTailorBezier,
                  }}
                  className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-pill bg-suiting px-1 text-[0.6875rem] font-semibold leading-none text-white"
                >
                  {bagCount}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </button>

          <button
            type="button"
            onClick={() => {
              handleBarAction("#builder");
            }}
            className="hidden h-10 shrink-0 items-center rounded-pill bg-red-deep px-5 text-[0.9375rem] font-semibold text-white transition-opacity duration-300 hover:opacity-90 min-[900px]:inline-flex"
          >
            Build a gift
          </button>

          <div className="min-[900px]:hidden">
            <MobileMenu
              open={menuOpen}
              onOpenChange={setMenuOpen}
              items={NAV_ITEMS}
              footer={
                <button
                  type="button"
                  onClick={() => {
                    handleBarAction("#builder");
                  }}
                  className="inline-flex h-12 w-full items-center justify-center rounded-pill bg-red-deep px-7 text-[1rem] font-semibold text-white transition-opacity duration-300 hover:opacity-90"
                >
                  Build a gift
                </button>
              }
            />
          </div>
        </div>
      </motion.nav>

      <BagDrawer />
    </div>
  );
}
