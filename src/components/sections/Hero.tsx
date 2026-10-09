"use client";

import { motion, type Variants } from "motion/react";
import { HeroActions } from "@/components/sections/HeroActions";

const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Hero block. motion/react owns this mount animation; scroll-driven
 * unboxing layers arrive in a later phase and will be GSAP-owned.
 */
export function Hero() {
  return (
    <section
      id="hero"
      className="shell scroll-mt-28 pt-44 pb-24 lg:pt-56 lg:pb-36"
    >
      <motion.div
        variants={heroContainer}
        initial="hidden"
        animate="show"
        className="grid-12"
      >
        <div className="col-span-12 lg:col-start-2 lg:col-span-9">
          <motion.h1 variants={heroItem}>
            Gift him the fabric. His tailor makes it his.
          </motion.h1>
        </div>
        <div className="col-span-12 mt-10 lg:col-start-2 lg:col-span-6">
          <motion.p variants={heroItem} className="text-chalk">
            Kushagra boxes premium unstitched shirting and suiting for the
            people who give well — sisters, families, wives, teams. He
            unfolds it, his tailor stitches it, and he stands out.
          </motion.p>
          <motion.p variants={heroItem} className="mt-8 font-medium text-suiting">
            Select • Stitch • Stand out
          </motion.p>
          <motion.div variants={heroItem} className="mt-10">
            <HeroActions />
          </motion.div>
        </div>
        <div className="col-span-12 mt-20 lg:col-start-2 lg:col-span-10 lg:mt-28">
          <motion.div variants={heroItem}>
            <div className="stitch-rule w-full" aria-hidden="true" />
            <p className="mt-6 text-sm text-chalk">
              Unstitched, unbranded, unmistakably his. Every box is folded by
              hand in Surat and ships with a note card in your words.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
