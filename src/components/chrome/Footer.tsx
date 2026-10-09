"use client";

/**
 * The footer.
 *
 * A dashed thread stitch runs across the top edge and draws itself once,
 * left to right, when the footer enters the viewport. Top row: logo, one
 * line, three link columns and the rotating SELECT • STITCH • STAND OUT
 * badge with the K mark in its centre. Below that, the giant KUSHAGRA
 * wordmark — Bodoni Moda on its variable weight axis — presses heavier and
 * taller near the cursor (TextPressure). The bottom bar carries the
 * copyright, the legal links and the contact anchors.
 */

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

import { NavLink } from "@/components/chrome/NavLink";
import { CircularText } from "@/components/reactbits/CircularText";
import { TextPressure } from "@/components/reactbits/TextPressure";
import { color, gsapEaseName } from "@/lib/tokens";
import { EMAIL, PHONE_DISPLAY, PHONE_TEL, WHATSAPP_LINK } from "@/lib/contact";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* -------------------------------------------------------------- columns -- */

interface FooterLink {
  readonly label: string;
  readonly href: string;
}

const LINK_COLUMNS: readonly {
  readonly title: string;
  readonly links: readonly FooterLink[];
}[] = [
  {
    title: "Shop",
    links: [
      { label: "Occasions", href: "/#occasions" },
      { label: "Fabrics", href: "/fabrics" },
      { label: "Boxes", href: "/boxes" },
      { label: "Build a gift", href: "/build" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Delivery", href: "/delivery" },
      { label: "Care guide", href: "/care" },
      { label: "Returns", href: "/returns" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Corporate gifting", href: "/corporate" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

/* ---------------------------------------------------------- footer stitch -- */

/**
 * The last stitch on the page: full-width, dashed --thread, drawn once when
 * the footer scrolls into view. Under reduced motion it sits fully drawn.
 */
function FooterStitch() {
  const prefersReducedMotion = useReducedMotion();
  const reduced = prefersReducedMotion === true;

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const dashedRef = useRef<SVGPathElement | null>(null);
  const maskPathRef = useRef<SVGPathElement | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const drawnRef = useRef(false);
  const reducedRef = useRef(reduced);

  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  const build = useCallback(() => {
    const wrap = wrapRef.current;
    const dashed = dashedRef.current;
    const maskPath = maskPathRef.current;
    if (wrap === null || dashed === null || maskPath === null) return;

    triggerRef.current?.kill();
    triggerRef.current = null;
    tweenRef.current?.kill();
    tweenRef.current = null;

    const width = wrap.getBoundingClientRect().width;
    const d = `M 0 2 L ${width.toFixed(1)} 2`;
    dashed.setAttribute("d", d);
    maskPath.setAttribute("d", d);
    maskPath.style.strokeDasharray = `${width}`;

    if (reducedRef.current || drawnRef.current) {
      maskPath.style.strokeDashoffset = "0";
      return;
    }

    maskPath.style.strokeDashoffset = `${width}`;
    triggerRef.current = ScrollTrigger.create({
      trigger: wrap,
      start: "top 96%",
      once: true,
      onEnter() {
        drawnRef.current = true;
        tweenRef.current = gsap.to(maskPath, {
          strokeDashoffset: 0,
          duration: 1.1,
          ease: gsapEaseName,
        });
      },
    });
  }, []);

  useEffect(() => {
    build();

    let resizeFrame = 0;
    const handleResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(build);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", handleResize);
      triggerRef.current?.kill();
      tweenRef.current?.kill();
    };
  }, [build, reduced]);

  return (
    <div ref={wrapRef} aria-hidden="true" className="h-[4px] w-full">
      <svg className="block h-full w-full overflow-visible">
        <defs>
          <mask id="footer-stitch-mask">
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
          ref={dashedRef}
          fill="none"
          stroke={color.thread}
          strokeWidth={2}
          strokeDasharray="10 8"
          strokeLinecap="round"
          mask="url(#footer-stitch-mask)"
        />
      </svg>
    </div>
  );
}

/* ----------------------------------------------------------------- footer -- */

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-shirting text-suiting">
      <FooterStitch />

      <div className="grid-shell pt-16 lg:pt-20">
        <div className="col-span-12 flex flex-col gap-14 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-6 lg:max-w-[300px]">
            <Image
              src="/brand/kushagra-logo.png"
              alt="Kushagra"
              width={204}
              height={141}
              loading="lazy"
              decoding="async"
              className="h-auto w-[164px]"
            />
            <p className="text-[1.0625rem] text-chalk">
              Premium fabric, boxed for the men you love.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-3 lg:pt-2"
          >
            {LINK_COLUMNS.map((column) => (
              <div key={column.title} className="flex flex-col gap-4">
                <p className="font-semibold">{column.title}</p>
                <ul className="flex flex-col text-[0.9375rem] text-chalk">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <NavLink
                        href={link.href}
                        className="inline-flex min-h-[44px] items-center transition-colors duration-300 hover:text-suiting"
                      >
                        {link.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <CircularText
            text="SELECT • STITCH • STAND OUT • "
            size={140}
            className="text-suiting lg:pt-2"
          >
            <Image
              src="/brand/kushagra-mark.png"
              alt=""
              width={30}
              height={36}
              loading="lazy"
              decoding="async"
              className="h-9 w-[30px]"
            />
          </CircularText>
        </div>

        <div className="col-span-12 mt-16 lg:mt-24">
          <TextPressure
            text="KUSHAGRA"
            className="font-display text-suiting text-[clamp(2.5rem,16vw,14rem)]"
          />
        </div>

        <div className="col-span-12 mt-10 flex flex-col gap-4 border-t border-line py-8 text-[0.875rem] text-chalk lg:mt-14 sm:flex-row sm:items-center sm:justify-between">
          <p data-numeric>© {year} Kushagra. All rights reserved.</p>

          <nav aria-label="Legal">
            <ul className="flex gap-x-4">
              <li>
                <NavLink
                  href="/privacy"
                  className="inline-flex min-h-[44px] items-center px-2 transition-colors duration-300 hover:text-suiting"
                >
                  Privacy
                </NavLink>
              </li>
              <li>
                <NavLink
                  href="/terms"
                  className="inline-flex min-h-[44px] items-center px-2 transition-colors duration-300 hover:text-suiting"
                >
                  Terms
                </NavLink>
              </li>
            </ul>
          </nav>

          <ul className="flex flex-wrap gap-x-4">
            <li>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[44px] items-center px-2 transition-colors duration-300 hover:text-suiting"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a
                href={`tel:${PHONE_TEL}`}
                data-numeric
                className="inline-flex min-h-[44px] items-center px-2 transition-colors duration-300 hover:text-suiting"
              >
                {PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex min-h-[44px] items-center px-2 transition-colors duration-300 hover:text-suiting"
              >
                {EMAIL}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
