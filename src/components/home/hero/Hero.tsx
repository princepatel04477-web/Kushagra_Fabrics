"use client";

/**
 * The unboxing hero: a short product film the visitor scrubs with the
 * scroll (docs/HERO_PLAN.md).
 *
 * First paint is server-rendered: the headline, the two actions and a still
 * of the closed box rendered from the scene itself. After the page is idle
 * the three.js scene (HeroScene, lazy, client-only) fades in over the still
 * at the same framing, and a pinned ScrollTrigger scrubs one progress value
 * through the film: ribbon, lid, tissue, cloth. heroPose() in
 * src/lib/heroTimeline.ts is the single description of every beat; this
 * component only maps it onto the copy, the step counter and the tags.
 *
 * Reduced motion, no JS, no WebGL and low-memory devices get the static
 * hero: the same headline beside a still of the open box with the cloths
 * named. Nothing pins.
 *
 * Desktop (≥ 900px and landscape): the copy sits left over a full-bleed
 * stage, and the whole hero pins for 200% of the viewport. Below that the
 * copy comes first and only the square visual pins, for 150%.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import { getImageProps } from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { NavLink } from "@/components/chrome/NavLink";
import { fabrics } from "@/lib/data";
import { HERO_STEPS, heroPose } from "@/lib/heroTimeline";

import { POSTERS, TAG_ANCHORS, type Crop, type Poster } from "./posters";
import { createHeroProgress } from "./progress";
import type { HeroLayout } from "./scene/CameraRig";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

/** Keep in step with the `--hero-desktop` media block in globals.css. */
const DESKTOP = "(min-width: 900px) and (min-aspect-ratio: 5/4)";
const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/** The three lengths in the box, back to front, as named in the catalogue. */
const TAGGED = ["oxford-white", "sky-end-on-end", "charcoal-herringbone"] as const;
const TAGS = TAGGED.map((id) => {
  const fabric = fabrics.find((item) => item.id === id);
  return {
    id,
    name: fabric?.name ?? id,
    kind: fabric?.kind === "suiting" ? "Suiting" : "Shirting",
  };
});

type Mode = "poster" | "live" | "static";
type CSSVars = CSSProperties & { [key: `--${string}`]: string | number };

function cropStyle(desktop: Crop, mobile: Crop): CSSVars {
  return {
    "--dx": desktop.x,
    "--dy": desktop.y,
    "--dw": desktop.w,
    "--dh": desktop.h,
    "--mx": mobile.x,
    "--my": mobile.y,
    "--mw": mobile.w,
    "--mh": mobile.h,
  };
}

/** One poster as a <picture>: the desktop render on wide screens, the square one below. */
function PosterPicture({
  desktop,
  mobile,
  className,
  eager,
}: {
  desktop: Poster;
  mobile: Poster;
  className: string;
  eager: boolean;
}) {
  const common = { alt: "", quality: 82 } as const;
  const wide = getImageProps({
    ...common,
    src: desktop.image,
    // The render frame is 1.6 × the stage height wide; the crop is a share of it.
    sizes: `${Math.round(desktop.crop.w * 160)}vh`,
  }).props;
  const square = getImageProps({
    ...common,
    src: mobile.image,
    sizes: "(max-width: 600px) 100vw, 560px",
    loading: eager ? "eager" : "lazy",
    fetchPriority: eager ? "high" : "auto",
  }).props;

  return (
    <picture className={className} style={cropStyle(desktop.crop, mobile.crop)}>
      <source media={DESKTOP} srcSet={wide.srcSet} sizes={wide.sizes} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- decorative; alt="" is in the spread props */}
      <img {...square} className="hero-poster-img" />
    </picture>
  );
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return canvas.getContext("webgl2") !== null || canvas.getContext("webgl") !== null;
  } catch {
    return false;
  }
}

/** Phones that report 2 GB or less get the still: the scene would stutter. */
function isLowMemory(): boolean {
  const memory: unknown = Reflect.get(navigator, "deviceMemory");
  return typeof memory === "number" && memory <= 2;
}

export function Hero() {
  const rootRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const stepNumberRef = useRef<HTMLSpanElement | null>(null);
  const stepLabelRef = useRef<HTMLSpanElement | null>(null);

  const progress = useMemo(() => createHeroProgress(0), []);
  const [mode, setMode] = useState<Mode>("poster");
  const [layout, setLayout] = useState<HeroLayout>("desktop");
  const [parallax, setParallax] = useState(false);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  // Decide once, after hydration, whether this visitor gets the film.
  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP);
    const syncLayout = () => setLayout(desktop.matches ? "desktop" : "mobile");
    syncLayout();
    desktop.addEventListener("change", syncLayout);
    setParallax(window.matchMedia("(pointer: fine)").matches);

    if (!window.matchMedia(MOTION_OK).matches || !hasWebGL() || isLowMemory()) {
      setMode("static");
      return () => desktop.removeEventListener("change", syncLayout);
    }

    // three.js waits until the page has settled, so it never competes with
    // the first paint; the closed still holds the frame meanwhile.
    let idle = 0;
    let timer = 0;
    const start = () => setMode("live");
    // Safari only gained requestIdleCallback recently.
    if (typeof Reflect.get(window, "requestIdleCallback") === "function") {
      idle = window.requestIdleCallback(start, { timeout: 1500 });
    } else {
      timer = window.setTimeout(start, 400);
    }
    return () => {
      desktop.removeEventListener("change", syncLayout);
      if (idle !== 0) window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
    };
  }, []);

  const filmOn = mode !== "static";

  useGSAP(
    () => {
      const root = rootRef.current;
      const pin = pinRef.current;
      const stage = stageRef.current;
      const copy = copyRef.current;
      const end = endRef.current;
      if (!filmOn || root === null || pin === null || stage === null || copy === null || end === null) {
        return;
      }

      let lastStep = -1;
      const apply = (value: number, desktop: boolean) => {
        progress.set(value);
        const pose = heroPose(value);
        root.style.setProperty("--copy-out", desktop ? pose.copyOut.toFixed(4) : "0");
        root.style.setProperty("--end-in", pose.endIn.toFixed(4));
        root.style.setProperty("--film", value.toFixed(4));
        root.toggleAttribute("data-moving", value > 0.002);
        // Only what is on screen takes focus and clicks.
        copy.inert = desktop && pose.copyOut > 0.5;
        end.inert = pose.endIn < 0.5;
        if (pose.step !== lastStep) {
          lastStep = pose.step;
          if (stepNumberRef.current !== null) {
            stepNumberRef.current.textContent = String(pose.step + 1).padStart(2, "0");
          }
          if (stepLabelRef.current !== null) {
            stepLabelRef.current.textContent = HERO_STEPS[pose.step] ?? "";
          }
        }
      };

      const mm = gsap.matchMedia();
      mm.add(
        { desktop: `${DESKTOP} and ${MOTION_OK}`, mobile: `not all and ${DESKTOP}` },
        (context) => {
          const desktop = context.conditions?.desktop === true;
          apply(0, desktop);
          ScrollTrigger.create({
            trigger: desktop ? pin : stage,
            pin: desktop ? pin : stage,
            start: "top top",
            end: desktop ? "+=200%" : "+=150%",
            scrub: 0.8,
            anticipatePin: 1,
            // The pin adds its spacing before anything below measures.
            refreshPriority: 1,
            onUpdate: (self) => apply(self.progress, desktop),
            onRefresh: (self) => apply(self.progress, desktop),
          });
          return () => {
            copy.inert = false;
            end.inert = false;
            root.removeAttribute("data-moving");
          };
        },
      );
      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [filmOn] },
  );

  return (
    <section
      ref={rootRef}
      id="hero"
      aria-labelledby="hero-heading"
      className="hero"
      data-mode={mode}
      data-ready={ready ? "" : undefined}
    >
      <div ref={pinRef} className="hero-pin">
        <div ref={copyRef} className="hero-copy">
          <div className="grid-shell w-full">
            <div className="col-span-12 flex flex-col gap-8 min-[900px]:col-span-5">
              <h1 id="hero-heading" className="hero-title">
                Give him the cloth. Let him make it his.
              </h1>
              <p className="max-w-[40ch] text-[1.125rem] text-chalk">
                Premium shirting and suiting lengths, boxed for gifting. You
                choose the cloth. He chooses the cut.
              </p>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <NavLink href="/build" className="btn-solid">
                  Build a gift box
                </NavLink>
                <NavLink href="/fabrics" className="link-quiet">
                  See the fabrics
                </NavLink>
              </div>
              <div className="hero-cue-row flex items-center gap-4" aria-hidden="true">
                <span className="hero-cue">
                  <span className="hero-cue-dash" />
                </span>
                <span className="text-[0.9375rem] text-chalk">Scroll to open the box</span>
              </div>
            </div>
          </div>
        </div>

        <div ref={stageRef} className="hero-stage">
          <div className="hero-visual">
            <div className="hero-frame" aria-hidden="true">
              <PosterPicture
                desktop={POSTERS.desktop.closed}
                mobile={POSTERS.mobile.closed}
                className="hero-poster hero-poster-closed"
                eager
              />
              <PosterPicture
                desktop={POSTERS.desktop.open}
                mobile={POSTERS.mobile.open}
                className="hero-poster hero-poster-open"
                eager={false}
              />
            </div>

            {mode === "live" ? (
              <HeroScene
                progress={progress}
                layout={layout}
                parallax={parallax && layout === "desktop"}
                onReady={onReady}
                className="hero-canvas"
              />
            ) : null}

            <div className="hero-frame hero-tags-frame">
              <ul className="hero-tags" aria-label="In this box">
                {TAGS.map((tag, index) => {
                  const desktop = TAG_ANCHORS.desktop[index];
                  const mobile = TAG_ANCHORS.mobile[index];
                  const style: CSSVars = {
                    "--tx": desktop?.x ?? 0,
                    "--ty": desktop?.y ?? 0,
                    "--tmx": mobile?.x ?? 0,
                    "--tmy": mobile?.y ?? 0,
                    "--i": index,
                  };
                  return (
                    <li key={tag.id} className="hero-tag" style={style}>
                      <span className="hero-tag-label">
                        <span className="text-suiting">{tag.name}</span>
                        <span className="text-chalk">{tag.kind}</span>
                      </span>
                      <span className="hero-tag-pin" aria-hidden="true" />
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div ref={endRef} className="hero-end">
            <div className="grid-shell w-full">
              <div className="col-span-12 flex flex-col gap-8 min-[900px]:col-span-5">
                <p className="hero-end-line font-display text-suiting">
                  Choose the cloth. His tailor does the rest.
                </p>
                <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
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

          <div className="hero-progress" aria-hidden="true">
            <div className="grid-shell w-full">
              <div className="col-span-12 flex flex-col gap-3">
                <p className="flex items-baseline gap-3 text-[0.9375rem] text-chalk">
                  <span className="tabular-nums text-suiting">
                    <span ref={stepNumberRef}>01</span> / {String(HERO_STEPS.length).padStart(2, "0")}
                  </span>
                  <span ref={stepLabelRef}>{HERO_STEPS[0]}</span>
                </p>
                <span className="hero-progress-track">
                  <span className="hero-progress-stitch" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
