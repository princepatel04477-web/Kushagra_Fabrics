"use client";

/**
 * React Bits — TextType (TS + Tailwind variant), restyled to Kushagra
 * tokens. https://reactbits.dev — hand-ported into src/components/reactbits
 *
 * Assigned to: the gift card (src/components/builder/GiftCard.tsx).
 * One location.
 *
 * Types the text letter by letter with a blinking caret. When the text
 * changes, a 250ms debounce settles first and only the changed tail is
 * retyped — the common prefix stays on the card, so typing fast in the note
 * field never restarts the animation. No loop, no delete, no GSAP: the caret
 * blinks through motion (opacity only) and the full text is always exposed
 * to screen readers.
 */

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

export interface TextTypeProps {
  readonly text: string;
  /** ms per character. Default 28. */
  readonly typingSpeed?: number;
  /** Debounce before a changed text is adopted. Default 250ms. */
  readonly debounceMs?: number;
  readonly className?: string;
}

export function TextType({
  text,
  typingSpeed = 28,
  debounceMs = 250,
  className,
}: TextTypeProps) {
  const [settled, setSettled] = useState(text);
  const [shown, setShown] = useState(0);
  const previousRef = useRef(text);

  // Adopt a changed text after the debounce; keep the common prefix on screen.
  useEffect(() => {
    if (text === previousRef.current) return;
    const timer = setTimeout(() => {
      const previous = previousRef.current;
      previousRef.current = text;
      let prefix = 0;
      while (
        prefix < previous.length &&
        prefix < text.length &&
        previous[prefix] === text[prefix]
      ) {
        prefix += 1;
      }
      setSettled(text);
      setShown((current) => Math.min(current, prefix));
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [text, debounceMs]);

  // Type one character at a time.
  useEffect(() => {
    if (shown >= settled.length) return;
    const timer = setTimeout(() => {
      setShown((current) => Math.min(current + 1, settled.length));
    }, typingSpeed);
    return () => clearTimeout(timer);
  }, [shown, settled, typingSpeed]);

  return (
    <span className={className}>
      <span aria-hidden="true">{settled.slice(0, shown)}</span>
      <motion.span
        aria-hidden="true"
        animate={{ opacity: [1, 0] }}
        transition={{
          duration: 0.9,
          ease: "linear",
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.12em] bg-suiting"
      />
      <span className="sr-only">{settled}</span>
    </span>
  );
}

export default TextType;
