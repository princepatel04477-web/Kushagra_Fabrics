"use client";

import { useLayoutEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { tokens } from "@/lib/tokens";

const SESSION_FLAG = "kushagra-preloaded";

/**
 * Session preloader: a thread-coloured stitch draws down (1.1s), the
 * lockup fades and scales in (0.5s), then the shirting layer lifts
 * away (0.8s, ease-tailor) and unmounts. Total 2.35s.
 * Plays once per session (sessionStorage flag) and never under
 * prefers-reduced-motion.
 */
export function Preloader() {
  const [phase, setPhase] = useState<"idle" | "run" | "done">("idle");

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setPhase("done");
      return;
    }
    let alreadyPlayed = false;
    try {
      alreadyPlayed = window.sessionStorage.getItem(SESSION_FLAG) === "1";
    } catch {
      alreadyPlayed = true;
    }
    if (alreadyPlayed) {
      setPhase("done");
      return;
    }
    try {
      window.sessionStorage.setItem(SESSION_FLAG, "1");
    } catch {
      /* private mode: play this once, then never again this session */
    }
    setPhase("run");
  }, []);

  return (
    <AnimatePresence>
      {phase === "run" && (
        <motion.div
          key="preloader"
          aria-hidden="true"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-shirting"
          initial={{ y: "0%" }}
          animate={{ y: "-100%" }}
          transition={{
            delay: 1.55,
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          onAnimationComplete={() => setPhase("done")}
        >
          <div className="flex flex-col items-center gap-7">
            <svg width="6" height="96" viewBox="0 0 6 96" fill="none">
              <motion.line
                x1="3"
                y1="3"
                x2="3"
                y2="93"
                stroke={tokens.color.thread}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="9 11"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
              />
            </svg>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 1.05,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Image
                src="/brand/kushagra-logo.png"
                alt=""
                width={1408}
                height={768}
                priority
                sizes="220px"
                className="h-28 w-auto select-none"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
