"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { useReducedMotion } from "motion/react";

import { easeTailorPath, gsapEaseName, layout } from "@/lib/tokens";

/**
 * Lenis is the only smooth-scroll source on the site, and it is wired straight
 * into GSAP's ticker so ScrollTrigger reads the same frame Lenis just wrote.
 *
 *   lenis.on("scroll", ScrollTrigger.update)  → triggers stay in sync
 *   gsap.ticker.add(t => lenis.raf(t * 1000)) → one rAF loop for everything
 *   gsap.ticker.lagSmoothing(0)               → no catch-up jumps after a stall
 *
 * Under prefers-reduced-motion Lenis is never created and native scrolling is
 * used instead, including for anchor navigation.
 */

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create(gsapEaseName, easeTailorPath);
}

export interface SmoothScrollApi {
  /** Scrolls an element under the floating nav. Accepts "#id" or an element. */
  scrollTo: (target: string | HTMLElement) => void;
  scrollToTop: () => void;
  /** Freeze scrolling — used by the mobile menu. */
  stop: () => void;
  start: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollApi | null>(null);

export function useSmoothScroll(): SmoothScrollApi {
  const api = useContext(SmoothScrollContext);
  if (api === null) {
    throw new Error("useSmoothScroll must be used inside <SmoothScroll>.");
  }
  return api;
}

/** Distance the floating nav occupies, plus a little air. */
function navOffset(): number {
  const bar = document.querySelector<HTMLElement>("[data-nav-bar]");
  if (bar !== null) {
    const { height } = bar.getBoundingClientRect();
    if (height > 0) {
      return layout.navTop + height + layout.navScrollPadding;
    }
  }
  return layout.navTop + layout.navHeight + layout.navScrollPadding;
}

/** expo.out — matches the tail of ease-tailor closely enough for scrolling. */
function expoOut(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  const reducedRef = useRef(false);

  reducedRef.current = prefersReducedMotion === true;

  useEffect(() => {
    if (prefersReducedMotion === true) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      autoRaf: false,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [prefersReducedMotion]);

  // Web fonts change every section's height; measure again once they land.
  useEffect(() => {
    void document.fonts.ready.then(() => {
      ScrollTrigger.refresh();
    });
  }, []);

  const scrollTo = useCallback((target: string | HTMLElement) => {
    const element =
      typeof target === "string"
        ? document.querySelector<HTMLElement>(target)
        : target;
    if (element === null) return;

    const offset = navOffset();
    const lenis = lenisRef.current;

    if (lenis !== null && !reducedRef.current) {
      lenis.scrollTo(element, {
        offset: -offset,
        duration: 1.1,
        easing: expoOut,
      });
      return;
    }

    window.scrollTo({
      top: element.getBoundingClientRect().top + window.scrollY - offset,
      behavior: reducedRef.current ? "auto" : "smooth",
    });
  }, []);

  const scrollToTop = useCallback(() => {
    const lenis = lenisRef.current;
    if (lenis !== null && !reducedRef.current) {
      lenis.scrollTo(0, { duration: 1.1, easing: expoOut });
      return;
    }
    window.scrollTo({
      top: 0,
      behavior: reducedRef.current ? "auto" : "smooth",
    });
  }, []);

  const stop = useCallback(() => {
    lenisRef.current?.stop();
    document.documentElement.dataset.scrollLocked = "true";
  }, []);

  const start = useCallback(() => {
    lenisRef.current?.start();
    delete document.documentElement.dataset.scrollLocked;
  }, []);

  const api = useMemo<SmoothScrollApi>(
    () => ({ scrollTo, scrollToTop, stop, start }),
    [scrollTo, scrollToTop, stop, start],
  );

  return (
    <SmoothScrollContext.Provider value={api}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
