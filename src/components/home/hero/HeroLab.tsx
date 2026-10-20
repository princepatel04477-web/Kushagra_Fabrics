"use client";

import { useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { NavLink } from "@/components/chrome/NavLink";

import { createHeroProgress } from "./progress";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

/** ?p=0.42 freezes the scene at that progress — for comparing stills. */
function frozenProgress(): number | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("p");
  if (raw === null) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/**
 * P0 spike stage: the load-frame layout from the plan (copy left, box right,
 * full-bleed canvas behind), pinned for 200% with the lid lift scrubbed.
 */
export function HeroLab() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const progress = useMemo(() => createHeroProgress(0), []);

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (stage === null) return;

      const frozen = frozenProgress();
      if (frozen !== null) {
        progress.set(frozen);
        return;
      }

      ScrollTrigger.create({
        trigger: stage,
        pin: true,
        start: "top top",
        end: "+=200%",
        scrub: 0.8,
        anticipatePin: 1,
        onUpdate: (self) => progress.set(self.progress),
      });
    },
    { scope: stageRef },
  );

  return (
    <>
      <section aria-labelledby="lab-heading" className="relative">
        <div ref={stageRef} className="relative h-svh min-h-[640px] overflow-hidden bg-shirting">
          <HeroCanvas progress={progress} shift={0.2} className="!absolute inset-0" />

          <div className="pointer-events-none relative z-10 flex h-full items-center pt-[92px]">
            <div className="grid-shell w-full">
              <div className="col-span-12 flex flex-col gap-8 min-[900px]:col-span-5">
                <h1
                  id="lab-heading"
                  className="font-display text-[clamp(3rem,5.4vw,5.5rem)] leading-[1.02] tracking-[-0.02em] text-suiting"
                >
                  Give him the cloth. Let him make it his.
                </h1>
                <p className="max-w-[40ch] text-[1.125rem] text-chalk">
                  Premium shirting and suiting lengths, boxed for gifting. You
                  choose the cloth. He chooses the cut.
                </p>
                <div className="pointer-events-auto flex flex-wrap items-center gap-x-8 gap-y-4">
                  <NavLink href="/build" className="btn-solid">
                    Build a gift box
                  </NavLink>
                  <NavLink href="/fabrics" className="link-quiet">
                    See the fabrics
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="h-[60vh]" aria-hidden="true" />
    </>
  );
}
