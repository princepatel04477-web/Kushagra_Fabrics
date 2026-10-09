"use client";

/**
 * The unboxing hero — the one scroll-driven sequence on the home page.
 *
 * Desktop (≥ 900px, motion allowed): the stage pins for 250% of the viewport
 * and one scrubbed GSAP timeline walks the box open:
 *
 *   0.00–0.15  ribbon slides off, bow drops away (the intro fades with it)
 *   0.15–0.37  lid lifts and tips back, then drifts out of frame
 *   0.35–0.55  tissue folds outward over the walls
 *   0.55–0.85  the twill grows up out of the box; the box turns to face you
 *   0.85–1.00  the twill lays flat across the left two-thirds and the
 *              headline rises onto it, character by character
 *
 * GSAP only tweens progress variables on the section; globals.css turns them
 * into transforms. That keeps one description of every state: the timeline,
 * the four mobile frames and the static end state all read the same CSS.
 *
 * Below 900px nothing pins: four swipeable frames show the same stages, with
 * the headline set underneath. Reduced motion and no-JS get the open box and
 * the set headline (the CSS defaults).
 */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "motion/react";

import { NavLink } from "@/components/chrome/NavLink";
import { cn } from "@/lib/cn";

import {
  HeroBox,
  heroStageStyle,
  heroTwillStyle,
  type CSSVars,
  type HeroStage,
} from "./HeroBox";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const DESKTOP_MOTION =
  "(min-width: 900px) and (prefers-reduced-motion: no-preference)";

const HEADLINE = ["Give him the cloth.", "Let him make it his."] as const;

/** Lines → words → characters, each character numbered for the stagger. */
let charCount = 0;
const HEADLINE_LINES = HEADLINE.map((line) =>
  line.split(" ").map((word) =>
    Array.from(word).map((character) => ({ character, index: charCount++ })),
  ),
);
const TITLE_STYLE: CSSVars = { "--n": charCount };

function charStyle(index: number): CSSVars {
  return { "--i": index };
}

/** Variables measure() overrides for a moment, then puts back. */
const MEASURE_VARS = ["--unfold", "--tilt", "--panel"] as const;
/** Variables measure() owns. */
const PANEL_VARS = ["--px", "--py", "--psx", "--psy"] as const;

interface Frame {
  readonly label: string;
  readonly stage: HeroStage;
}

const FRAMES: readonly Frame[] = [
  { label: "Ribboned and closed", stage: {} },
  { label: "Ribbon off", stage: { ribbon: 1 } },
  { label: "Lid up, tissue parted", stage: { ribbon: 1, lid: 1, tissue: 1 } },
  {
    label: "The cloth, unfolded",
    stage: { ribbon: 1, lid: 1, lidAway: 1, tissue: 1, unfold: 1, tilt: 1 },
  },
];

/* --------------------------------------------------------- mobile frames -- */

function HeroFrames() {
  const listRef = useRef<HTMLUListElement | null>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion() === true;

  useEffect(() => {
    const list = listRef.current;
    if (list === null) return;
    const items = Array.from(list.children);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = items.indexOf(entry.target);
          if (index >= 0) setActive(index);
        }
      },
      { root: list, threshold: 0.6 },
    );
    for (const item of items) observer.observe(item);
    return () => observer.disconnect();
  }, []);

  const show = (index: number) => {
    const list = listRef.current;
    const item = list?.children[index];
    if (list === null || list === undefined || item === undefined) return;
    const left =
      item.getBoundingClientRect().left -
      list.getBoundingClientRect().left +
      list.scrollLeft;
    list.scrollTo({ left, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div className="hero-frames grid-shell">
      <div className="col-span-12">
        <ul
          ref={listRef}
          className="hero-frames-list"
          aria-label="The unboxing, in four frames"
          tabIndex={0}
        >
          {FRAMES.map((frame, index) => (
            <li key={frame.label} className="hero-frame">
              <HeroBox style={heroStageStyle(frame.stage)} />
              <p className="hero-frame-caption text-[0.875rem] text-chalk">
                <span data-numeric>{index + 1}</span> · {frame.label}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-2 flex gap-1">
          {FRAMES.map((frame, index) => (
            <button
              key={frame.label}
              type="button"
              onClick={() => show(index)}
              aria-label={`Show frame ${index + 1} of ${FRAMES.length}: ${frame.label}`}
              aria-current={active === index ? "true" : undefined}
              className="grid h-11 w-11 place-items-center rounded-pill"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "h-2 w-2 rounded-pill transition-colors duration-300",
                  active === index ? "bg-suiting" : "bg-line",
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ hero -- */

export function Hero() {
  const rootRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const unfoldRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const stage = stageRef.current;
      const unfold = unfoldRef.current;
      const actions = actionsRef.current;
      if (root === null || stage === null || unfold === null || actions === null) {
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(DESKTOP_MOTION, () => {
        const style = root.style;

        // Where the standing twill sits on screen once fully grown — the flat
        // panel starts from exactly that rectangle. Measured with the end
        // values applied for a moment, then the live values are put back.
        const measure = () => {
          const saved = MEASURE_VARS.map(
            (name) => [name, style.getPropertyValue(name)] as const,
          );
          style.setProperty("--unfold", "1");
          style.setProperty("--tilt", "1");
          style.setProperty("--panel", "0");
          const from = unfold.getBoundingClientRect();
          const frame = stage.getBoundingClientRect();
          for (const [name, value] of saved) {
            if (value === "") style.removeProperty(name);
            else style.setProperty(name, value);
          }

          const width = frame.width * (2 / 3);
          const height = frame.height;
          if (width <= 0 || height <= 0) return;
          style.setProperty("--px", `${(from.left - frame.left).toFixed(1)}px`);
          style.setProperty("--py", `${(from.top - frame.top).toFixed(1)}px`);
          style.setProperty("--psx", (from.width / width).toFixed(4));
          style.setProperty("--psy", (from.height / height).toFixed(4));
        };

        // The float stops once the box starts opening, and the buttons only
        // take focus and clicks once they are actually on screen.
        const sync = (progress: number) => {
          root.toggleAttribute("data-moving", progress > 0.002);
          actions.inert = progress < 0.97;
        };

        gsap.set(root, {
          "--ribbon": 0,
          "--lid": 0,
          "--lid-away": 0,
          "--tissue": 0,
          "--unfold": 0,
          "--tilt": 0,
          "--panel": 0,
          "--type": 0,
        });
        measure();
        sync(0);

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            pin: true,
            start: "top top",
            end: "+=250%",
            scrub: 1,
            anticipatePin: 1,
            // The pin adds 250vh of spacing; everything below must measure
            // after it, including triggers created before this one.
            refreshPriority: 1,
            onRefresh: (self) => {
              measure();
              sync(self.progress);
            },
            onUpdate: (self) => sync(self.progress),
          },
        });

        const step = (name: string, at: number, duration: number) => {
          timeline.fromTo(root, { [name]: 0 }, { [name]: 1, duration }, at);
        };

        step("--ribbon", 0, 0.15);
        step("--lid", 0.15, 0.12);
        step("--lid-away", 0.25, 0.12);
        step("--tissue", 0.35, 0.2);
        step("--unfold", 0.55, 0.3);
        step("--tilt", 0.55, 0.3);
        step("--panel", 0.85, 0.1);
        step("--type", 0.88, 0.12);

        return () => {
          actions.inert = false;
          root.removeAttribute("data-moving");
          for (const name of PANEL_VARS) style.removeProperty(name);
        };
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      id="hero"
      aria-labelledby="hero-heading"
      className="hero"
    >
      <div ref={stageRef} className="hero-stage">
        <div className="hero-intro" aria-hidden="true">
          <div className="grid-shell w-full">
            <div className="col-span-6 flex flex-col gap-10">
              <p className="text-[clamp(1.5rem,2.4vw,2.25rem)] font-medium leading-[1.25] text-suiting">
                Select • Stitch • Stand Out
              </p>
              <div className="flex items-center gap-4">
                <span className="hero-cue">
                  <span className="hero-cue-dash" />
                </span>
                <span className="text-[0.9375rem] text-chalk">
                  Scroll to open the box
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-panel" style={heroTwillStyle} aria-hidden="true" />

        <div className="hero-scene" aria-hidden="true">
          <div className="hero-float">
            <HeroBox unfoldRef={unfoldRef} priority />
          </div>
        </div>

        <HeroFrames />

        <div className="hero-copy">
          <div className="grid-shell w-full">
            <div className="col-span-12 flex flex-col gap-8 min-[900px]:col-span-8">
              <h1
                id="hero-heading"
                className="hero-title"
                aria-label={HEADLINE.join(" ")}
                style={TITLE_STYLE}
              >
                {HEADLINE_LINES.map((words, lineIndex) => (
                  <span key={lineIndex} className="hero-line" aria-hidden="true">
                    {words.map((characters, wordIndex) => (
                      <span key={wordIndex}>
                        {wordIndex > 0 ? " " : null}
                        <span className="hero-word">
                          {characters.map(({ character, index }) => (
                            <span
                              key={index}
                              className="hero-char"
                              style={charStyle(index)}
                            >
                              {character}
                            </span>
                          ))}
                        </span>
                      </span>
                    ))}
                  </span>
                ))}
              </h1>

              <p className="hero-sub max-w-[46ch] text-[1.125rem] text-chalk min-[900px]:text-shirting/80">
                Premium shirting and suiting lengths, boxed for gifting. You
                choose the cloth. He chooses the cut.
              </p>

              <div
                ref={actionsRef}
                className="hero-actions flex flex-wrap items-center gap-x-8 gap-y-4"
              >
                <NavLink
                  href="/build"
                  className="inline-flex h-12 items-center rounded-pill bg-red-deep px-7 text-[1rem] font-semibold text-white transition-opacity duration-300 hover:opacity-90"
                >
                  Build a gift box
                </NavLink>
                <NavLink
                  href="/fabrics"
                  className="inline-flex min-h-[44px] items-center text-[1rem] font-medium text-suiting underline decoration-line decoration-1 underline-offset-[6px] transition-colors duration-300 hover:decoration-suiting min-[900px]:text-shirting min-[900px]:decoration-shirting/40 min-[900px]:hover:decoration-shirting"
                >
                  See the fabrics
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
