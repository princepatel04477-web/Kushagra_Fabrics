"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { tokens } from "@/lib/tokens";

gsap.registerPlugin(ScrollTrigger, CustomEase);
CustomEase.create("tailor", "0.22, 1, 0.36, 1");

export interface SmoothScrollContextValue {
  /** True when Lenis is running (false under prefers-reduced-motion). */
  enabled: boolean;
  /** Scroll to a section id with the nav-height offset applied. */
  scrollTo: (id: string) => void;
  /** Freeze scrolling (mobile menu open). */
  stop: () => void;
  /** Resume scrolling. */
  start: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(
  null,
);

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduced) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenisRef.current = lenis;

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    let alive = true;
    document.fonts.ready.then(() => {
      if (alive) ScrollTrigger.refresh();
    });

    return () => {
      alive = false;
      gsap.ticker.remove(tick);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  const value = useMemo<SmoothScrollContextValue>(
    () => ({
      enabled: !reduced,
      scrollTo: (id: string) => {
        const offset = -tokens.layout.navOffset;
        const lenis = lenisRef.current;
        if (id === "top") {
          if (lenis) lenis.scrollTo(0, { duration: 1.1 });
          else window.scrollTo({ top: 0, behavior: "auto" });
          return;
        }
        const target = document.getElementById(id);
        if (!target) return;
        if (lenis) lenis.scrollTo(target, { offset, duration: 1.1 });
        else target.scrollIntoView({ block: "start", behavior: "auto" });
      },
      stop: () => lenisRef.current?.stop(),
      start: () => lenisRef.current?.start(),
    }),
    [reduced],
  );

  return (
    <SmoothScrollContext.Provider value={value}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll(): SmoothScrollContextValue {
  const context = useContext(SmoothScrollContext);
  if (!context) {
    throw new Error("useSmoothScroll must be used inside SmoothScrollProvider");
  }
  return context;
}
