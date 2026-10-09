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
 */

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { color, duration as tokenDuration, easeTailorBezier } from "@/lib/tokens";

const PRELOADER_FLAG = "kushagra-preloaded";

const STITCH_LENGTH = 120;

const LOGO_DELAY = tokenDuration.stitch - 0.25;
const CURTAIN_DELAY = LOGO_DELAY + tokenDuration.logo + 0.1;

export function Preloader() {
  const prefersReducedMotion = useReducedMotion();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion === true) return;

    let alreadyPlayed = false;
    try {
      alreadyPlayed =
        globalThis.sessionStorage?.getItem(PRELOADER_FLAG) === "1";
    } catch {
      alreadyPlayed = false;
    }
    if (alreadyPlayed) return;

    try {
      globalThis.sessionStorage?.setItem(PRELOADER_FLAG, "1");
    } catch {
      /* private mode — the animation simply replays on reload */
    }

    setPlaying(true);
  }, [prefersReducedMotion]);

  return (
    <AnimatePresence>
      {playing ? (
        <motion.div
          key="preloader"
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[200] grid place-items-center bg-shirting"
          initial={{ y: 0 }}
          animate={{ y: "-100%" }}
          transition={{
            duration: tokenDuration.curtain,
            ease: easeTailorBezier,
            delay: CURTAIN_DELAY,
          }}
          onAnimationComplete={() => {
            setPlaying(false);
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
