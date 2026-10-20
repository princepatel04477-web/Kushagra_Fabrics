"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { createHeroProgress } from "./progress";
import type { ScreenPoint } from "./scene/Anchors";
import { POSTER_FRAME } from "./posters";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

function param(name: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

/**
 * Development bench for the hero scene (see src/app/hero-lab/page.tsx).
 *
 *   ?p=0.42                 freeze the film at that progress
 *   ?layout=mobile          the portrait rig
 *   ?poster=1&p=0|1         render the bare scene on a transparent page at
 *                           the poster frame size, unshifted, for capturing
 *                           the poster stills (see posters.ts). The frame's
 *                           data-anchors attribute holds the tag positions.
 *
 * Without ?p the stage pins and the whole film scrubs with the scroll.
 */
export function HeroLab() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const progress = useMemo(() => createHeroProgress(0), []);
  const layout = param("layout") === "mobile" ? "mobile" : "desktop";
  const poster = param("poster") === "1";
  const [anchors, setAnchors] = useState("");
  const [ready, setReady] = useState(false);

  const onAnchors = useCallback((points: readonly ScreenPoint[]) => {
    setAnchors(points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" "));
  }, []);
  const onReady = useCallback(() => setReady(true), []);

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (stage === null) return;

      const raw = param("p");
      const frozen = raw === null ? Number.NaN : Number(raw);
      if (Number.isFinite(frozen)) {
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

  if (poster) {
    const frame = POSTER_FRAME[layout];
    return (
      <>
        <style>{`html, body, main { background: transparent !important; }
          html { overflow: hidden !important; scrollbar-width: none; }
          body { visibility: hidden; }
          nextjs-portal { display: none !important; }
          [data-poster-frame] { visibility: visible; }`}</style>
        <div
          ref={stageRef}
          data-poster-frame
          data-anchors={anchors}
          data-ready={ready ? "1" : "0"}
          className="fixed left-0 top-0 z-[999]"
          style={{ width: frame.width, height: frame.height }}
        >
          <HeroScene
            progress={progress}
            layout={layout}
            shift={0}
            onReady={onReady}
            onAnchors={onAnchors}
            className="!absolute inset-0"
          />
        </div>
      </>
    );
  }

  return (
    <>
      <section aria-labelledby="lab-heading" className="relative">
        <div ref={stageRef} className="relative h-svh min-h-[640px] overflow-hidden bg-shirting">
          <HeroScene progress={progress} layout={layout} className="!absolute inset-0" />
          <h1 id="lab-heading" className="sr-only">
            Hero lab
          </h1>
        </div>
      </section>
      <div className="h-[60vh]" aria-hidden="true" />
    </>
  );
}
