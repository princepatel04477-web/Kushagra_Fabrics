"use client";

/**
 * Opening stitch.
 *
 * 1. A dashed thread line is drawn down the centre with stroke-dashoffset
 *    (1.1s) — the mask path is a solid stroke that grows, revealing the dashed
 *    thread underneath.
 * 2. The logo fades in and settles 0.96 → 1 (0.5s).
 * 3. The whole layer lifts translateY(-100%) over 0.8s with ease-tailor, then
 *    unmounts through AnimatePresence (2.25s in total).
 *
 * It plays once per session and never under prefers-reduced-motion.
 *
 * No flash: the shirting layer is part of the server HTML, so the page never
 * shows for a frame before the loader covers it. HEAD_SCRIPT (lib/headScript) runs before
 * first paint and hides the layer (html[data-preloaded]) when it should not
 * play. The session flag is written when the curtain finishes, not when it
 * starts, so StrictMode's double effect cannot skip the animation.
 */

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { PRELOADER_FLAG } from "@/lib/headScript";
import { color, duration as tokenDuration, easeTailorBezier } from "@/lib/tokens";

const STITCH_LENGTH = 120;

const LOGO_DELAY = tokenDuration.stitch - 0.25;
const CURTAIN_DELAY = LOGO_DELAY + tokenDuration.logo + 0.1;

type Phase = "pending" | "playing" | "done";

function shouldSkip(): boolean {
  if (document.documentElement.dataset.preloaded === "1") return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return true;
  }
  try {
    return globalThis.sessionStorage?.getItem(PRELOADER_FLAG) === "1";
  } catch {
    return true;
  }
}

function markPlayed() {
  document.documentElement.dataset.preloaded = "1";
  try {
    globalThis.sessionStorage?.setItem(PRELOADER_FLAG, "1");
  } catch {
    /* private mode — the animation simply replays on reload */
  }
}

export function Preloader() {
  const [phase, setPhase] = useState<Phase>("pending");
  const { stop, start } = useSmoothScroll();

  useEffect(() => {
    setPhase(shouldSkip() ? "done" : "playing");
  }, []);

  // Hold the page still under the curtain. This runs on the commit after
  // mount, by which time SmoothScroll has constructed Lenis.
  useEffect(() => {
    if (phase !== "playing") return;
    stop();
    return () => start();
  }, [phase, stop, start]);

  return (
    <AnimatePresence>
      {phase === "pending" ? (
        <div
          key="preloader-static"
          aria-hidden="true"
          className="preloader fixed inset-0 z-[200] bg-shirting"
        />
      ) : null}

      {phase === "playing" ? (
        <motion.div
          key="preloader"
          role="status"
          aria-live="polite"
          className="preloader fixed inset-0 z-[200] grid place-items-center bg-shirting"
          initial={{ y: 0 }}
          animate={{ y: "-100%" }}
          transition={{
            duration: tokenDuration.curtain,
            ease: easeTailorBezier,
            delay: CURTAIN_DELAY,
          }}
          onAnimationComplete={() => {
            markPlayed();
            setPhase("done");
          }}
        >
          <span className="sr-only">Loading Kushagra</span>

          <div className="flex flex-col items-center gap-10">
            <svg
              width="3"
              height={STITCH_LENGTH}
              viewBox={`0 0 3 ${STITCH_LENGTH}`}
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <mask
                  id="kushagra-preloader-stitch"
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="3"
                  height={STITCH_LENGTH}
                >
                  <motion.path
                    d={`M1.5 0 V${STITCH_LENGTH}`}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={8}
                    strokeLinecap="butt"
                    strokeDasharray={`${STITCH_LENGTH} ${STITCH_LENGTH}`}
                    initial={{ strokeDashoffset: STITCH_LENGTH }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{
                      duration: tokenDuration.stitch,
                      ease: easeTailorBezier,
                    }}
                  />
                </mask>
              </defs>
              <path
                d={`M1.5 0 V${STITCH_LENGTH}`}
                fill="none"
                stroke={color.thread}
                strokeWidth={3}
                strokeLinecap="butt"
                strokeDasharray="6.4 9.6"
                mask="url(#kushagra-preloader-stitch)"
              />
            </svg>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: tokenDuration.logo,
                ease: easeTailorBezier,
                delay: LOGO_DELAY,
              }}
            >
              <Image
                src="/brand/kushagra-logo.png"
                alt="Kushagra"
                width={180}
                height={124}
                priority
                className="h-auto w-[180px]"
              />
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
