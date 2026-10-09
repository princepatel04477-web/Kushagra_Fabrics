"use client";

/**
 * How it works — three steps arranged diagonally, joined by a stitch line.
 *
 * The stitch is an SVG dashed path in --color-thread, revealed by scroll:
 * a solid white copy of the path lives in an SVG mask and its
 * stroke-dashoffset is scrubbed by ScrollTrigger, so the dashes stay crisp
 * while the line draws itself forward and backward with the page. A small
 * "needle" (8px circle plus a trailing thread) rides the head of the reveal
 * via getPointAtLength, and each step's number flips from --chalk to
 * --suiting the moment the needle arrives.
 *
 * Below 900px the steps stack and the stitch becomes a straight vertical
 * dashed line down the left edge. Under prefers-reduced-motion the stitch
 * sits fully drawn, the needle is hidden and every number is already
 * --suiting.
 */

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

import { SectionShell } from "@/components/sections/SectionShell";
import { color, layout } from "@/lib/tokens";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Step {
  readonly title: string;
  readonly body: string;
  readonly image: string;
  readonly alt: string;
}

const STEPS: readonly Step[] = [
  {
    title: "Select the fabric",
    body: "You choose the cloth, the box and the note. We wrap it, tie the ribbon and deliver it to his door.",
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop",
    alt: "A length of fabric laid out for cutting",
  },
  {
    title: "He gets it stitched",
    body: "He takes the lengths to the tailor he trusts. Every box includes a care note and measurements for each length.",
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop",
    alt: "A tailor measuring and adjusting a garment on his client",
  },
  {
    title: "He stands out",
    body: "A shirt cut for his shoulders. A suit that fits the way he stands. Made from cloth you picked for him.",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop",
    alt: "A man wearing a dark tailored suit",
  },
];

/** How far back along the path the needle's trailing thread reaches. */
const NEEDLE_TRAIL = 18;
/** x position of the straight mobile stitch, in px from the wrap's left. */
const MOBILE_STITCH_X = 10;

interface Point {
  readonly x: number;
  readonly y: number;
}

/** Smooth S-curve through the three anchors, one cubic per pair. */
function curveThrough(points: readonly Point[]): string {
  const first = points[0];
  if (first === undefined || points.length < 2) return "";
  let d = `M ${first.x.toFixed(1)} ${first.y.toFixed(1)}`;
  for (let i = 1; i < points.length; i += 1) {
    const from = points[i - 1];
    const to = points[i];
    if (from === undefined || to === undefined) continue;
    const midY = (from.y + to.y) / 2;
    d += ` C ${from.x.toFixed(1)} ${midY.toFixed(1)}, ${to.x.toFixed(1)} ${midY.toFixed(1)}, ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
  }
  return d;
}

/** Path length closest to a point — the path is built to pass through it. */
function lengthAtPoint(path: SVGPathElement, point: Point): number {
  const total = path.getTotalLength();
  const samples = 600;
  let bestLength = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i <= samples; i += 1) {
    const length = (total * i) / samples;
    const p = path.getPointAtLength(length);
    const distance = Math.hypot(p.x - point.x, p.y - point.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestLength = length;
    }
  }
  return bestLength;
}

export function HowItWorks() {
  const prefersReducedMotion = useReducedMotion();
  const reduced = prefersReducedMotion === true;

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const dashedPathRef = useRef<SVGPathElement | null>(null);
  const maskPathRef = useRef<SVGPathElement | null>(null);
  const needleRef = useRef<SVGGElement | null>(null);
  const needleDotRef = useRef<SVGCircleElement | null>(null);
  const needleTrailRef = useRef<SVGLineElement | null>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const stitchTweenRef = useRef<gsap.core.Tween | null>(null);

  const build = useCallback(() => {
    const wrap = wrapRef.current;
    const dashed = dashedPathRef.current;
    const maskPath = maskPathRef.current;
    const needle = needleRef.current;
    if (wrap === null || dashed === null || maskPath === null || needle === null) {
      return;
    }

    const previous = stitchTweenRef.current;
    if (previous !== null) {
      previous.scrollTrigger?.kill();
      previous.kill();
      stitchTweenRef.current = null;
    }

    const wrapRect = wrap.getBoundingClientRect();
    const isMobile = window.innerWidth < layout.mobileBreakpoint;

    let d: string;
    let anchors: Point[];

    if (isMobile) {
      const first = stepRefs.current[0];
      const last = stepRefs.current[STEPS.length - 1];
      if (first === undefined || first === null) return;
      if (last === undefined || last === null) return;
      const firstRect = first.getBoundingClientRect();
      const lastRect = last.getBoundingClientRect();
      const top = firstRect.top - wrapRect.top + 14;
      const bottom = lastRect.bottom - wrapRect.top - 8;
      d = `M ${MOBILE_STITCH_X} ${top.toFixed(1)} L ${MOBILE_STITCH_X} ${bottom.toFixed(1)}`;
      anchors = numberRefs.current.map((el) => {
        if (el === null) return { x: MOBILE_STITCH_X, y: 0 };
        const r = el.getBoundingClientRect();
        return { x: MOBILE_STITCH_X, y: r.top - wrapRect.top + r.height / 2 };
      });
    } else {
      anchors = numberRefs.current.map((el) => {
        if (el === null) return { x: 0, y: 0 };
        const r = el.getBoundingClientRect();
        return {
          x: r.left - wrapRect.left + r.width / 2,
          y: r.top - wrapRect.top + r.height / 2,
        };
      });
      d = curveThrough(anchors);
    }

    dashed.setAttribute("d", d);
    maskPath.setAttribute("d", d);
    const total = dashed.getTotalLength();
    maskPath.style.strokeDasharray = `${total}`;

    const stepLengths = anchors.map((anchor) => lengthAtPoint(dashed, anchor));

    const applyState = (revealed: number) => {
      const clamped = Math.min(Math.max(revealed, 0), total);

      // The needle rides the head of the reveal, with a short thread behind.
      if (clamped <= 1) {
        needle.style.opacity = "0";
      } else {
        const head = dashed.getPointAtLength(clamped);
        const tail = dashed.getPointAtLength(Math.max(clamped - NEEDLE_TRAIL, 0));
        needle.style.opacity = "1";
        needleDotRef.current?.setAttribute("cx", head.x.toFixed(1));
        needleDotRef.current?.setAttribute("cy", head.y.toFixed(1));
        const trail = needleTrailRef.current;
        if (trail !== null) {
          trail.setAttribute("x1", tail.x.toFixed(1));
          trail.setAttribute("y1", tail.y.toFixed(1));
          trail.setAttribute("x2", head.x.toFixed(1));
          trail.setAttribute("y2", head.y.toFixed(1));
        }
      }

      // Each number answers the needle's arrival — a scroll response, not a fade.
      // Gated on the needle being visible so step 1 stays chalk at zero progress.
      stepLengths.forEach((length, index) => {
        const el = numberRefs.current[index];
        if (el === undefined || el === null) return;
        const arrived = clamped > 1 && clamped >= length - 1;
        el.style.color = arrived ? color.suiting : color.chalk;
      });
    };

    if (reducedRef.current) {
      maskPath.style.strokeDashoffset = "0";
      needle.style.opacity = "0";
      numberRefs.current.forEach((el) => {
        if (el !== null) el.style.color = color.suiting;
      });
      return;
    }

    maskPath.style.strokeDashoffset = `${total}`;
    applyState(0);

    stitchTweenRef.current = gsap.fromTo(
      maskPath,
      { strokeDashoffset: total },
      {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          id: "how-stitch",
          trigger: "#how",
          start: "top 70%",
          end: "bottom 60%",
          scrub: true,
          onUpdate(self) {
            applyState(self.progress * total);
          },
        },
      },
    );
  }, []);

  useEffect(() => {
    build();

    let resizeFrame = 0;
    const handleResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(build);
    };
    window.addEventListener("resize", handleResize);
    void document.fonts.ready.then(build);

    return () => {
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", handleResize);
      const tween = stitchTweenRef.current;
      if (tween !== null) {
        tween.scrollTrigger?.kill();
        tween.kill();
        stitchTweenRef.current = null;
      }
    };
  }, [build, reduced]);

  return (
    <SectionShell id="how" heading="How it works">
      <div ref={wrapRef} className="relative" data-how-steps="">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
        >
          <defs>
            <mask id="how-stitch-mask">
              <path
                ref={maskPathRef}
                fill="none"
                stroke="#ffffff"
                strokeWidth={8}
                strokeLinecap="round"
              />
            </mask>
          </defs>
          <path
            ref={dashedPathRef}
            fill="none"
            stroke={color.thread}
            strokeWidth={2}
            strokeDasharray="10 8"
            strokeLinecap="round"
            mask="url(#how-stitch-mask)"
          />
          <g ref={needleRef} style={{ opacity: 0 }}>
            <line
              ref={needleTrailRef}
              stroke={color.suiting}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <circle ref={needleDotRef} r={4} fill={color.suiting} />
          </g>
        </svg>

        <ol className="relative z-10 flex flex-col gap-20 lg:gap-0">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className={
                index === 0
                  ? "max-lg:pl-10 lg:w-[46%]"
                  : index === 1
                    ? "max-lg:pl-10 lg:mt-44 lg:ml-auto lg:w-[46%]"
                    : "max-lg:pl-10 lg:mt-44 lg:w-[46%]"
              }
            >
              <article
                ref={(el) => {
                  stepRefs.current[index] = el;
                }}
                className="flex flex-col"
              >
                <span
                  ref={(el) => {
                    numberRefs.current[index] = el;
                  }}
                  data-numeric
                  aria-hidden="true"
                  className="font-display text-[clamp(4.5rem,8vw,7.5rem)] leading-none"
                  style={{ color: reduced ? color.suiting : color.chalk }}
                >
                  {index + 1}
                </span>
                <h3 className="mt-3 text-suiting">{step.title}</h3>
                <p className="mt-3 max-w-[46ch] text-chalk">{step.body}</p>
                <Image
                  src={step.image}
                  alt={step.alt}
                  width={400}
                  height={240}
                  loading="lazy"
                  className="mt-6 h-[240px] w-full max-w-[400px] rounded-m border border-line object-cover"
                />
              </article>
            </li>
          ))}
        </ol>
      </div>
    </SectionShell>
  );
}
