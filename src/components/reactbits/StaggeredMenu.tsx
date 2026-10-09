"use client";

/**
 * Adapted from the React Bits "StaggeredMenu" component (TS + Tailwind
 * variant, shadcn registry: https://reactbits.dev/r/StaggeredMenu-TS-TW).
 * The registry was unreachable in this environment, so the TS-TW source
 * was vendored from the official DavidHDev/react-bits GitHub repository
 * and restyled to Kushagra design tokens.
 *
 * Kept from the original: pre-layer panels sliding in ahead of the content
 * panel, item labels rising with a stagger, GSAP-driven timeline.
 * Restyled: three panels in suiting, chalk and paper sliding from the
 * right 0.08s apart; links rise one by one (0.06s stagger) in Bodoni Moda
 * 2.5rem; token colours only; socials/numbering/logo removed.
 * Assigned location: src/components/chrome/MobileMenu.tsx (under 900px).
 */

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export interface StaggeredMenuItem {
  label: string;
  href: string;
}

export interface StaggeredMenuProps {
  open: boolean;
  items: readonly StaggeredMenuItem[];
  onNavigate: (href: string) => void;
  onClose: () => void;
}

const LAYER_CLASSES = [
  "absolute inset-0 bg-suiting",
  "absolute inset-0 bg-chalk",
  "absolute inset-0 flex flex-col justify-center bg-paper px-6 pt-24 pb-16",
] as const;

export function StaggeredMenu({ open, items, onNavigate, onClose }: StaggeredMenuProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  const collectLayers = () =>
    layerRefs.current.filter((layer): layer is HTMLDivElement => layer !== null);
  const collectLinks = () =>
    linkRefs.current.filter((link): link is HTMLAnchorElement => link !== null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      gsap.set(collectLayers(), { xPercent: 100 });
      gsap.set(collectLinks(), { yPercent: 120, rotate: 4 });
      gsap.set(root, { visibility: "hidden" });
    },
    { scope: rootRef },
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const layers = collectLayers();
    const links = collectLinks();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      if (open) {
        gsap.set(root, { visibility: "visible" });
        gsap.set(layers, { xPercent: 0 });
        gsap.set(links, { yPercent: 0, rotate: 0 });
      } else {
        gsap.set(root, { visibility: "hidden" });
        gsap.set(layers, { xPercent: 100 });
        gsap.set(links, { yPercent: 120, rotate: 4 });
      }
      return;
    }

    if (open) {
      gsap.set(root, { visibility: "visible" });
      const timeline = gsap.timeline();
      layers.forEach((layer, index) => {
        timeline.fromTo(
          layer,
          { xPercent: 100 },
          { xPercent: 0, duration: 0.55, ease: "power4.out" },
          index * 0.08,
        );
      });
      timeline.to(
        links,
        {
          yPercent: 0,
          rotate: 0,
          duration: 0.7,
          ease: "power4.out",
          stagger: 0.06,
        },
        layers.length * 0.08 + 0.28,
      );
      return () => {
        timeline.kill();
      };
    }

    const timeline = gsap.timeline({
      onComplete: () => {
        gsap.set(root, { visibility: "hidden" });
        gsap.set(links, { yPercent: 120, rotate: 4 });
      },
    });
    timeline.to(links, {
      yPercent: 120,
      rotate: 4,
      duration: 0.28,
      ease: "power3.in",
      stagger: 0.02,
    }, 0);
    timeline.to([...layers].reverse(), {
      xPercent: 100,
      duration: 0.4,
      ease: "power3.in",
      stagger: 0.05,
    }, 0.05);
    return () => {
      timeline.kill();
    };
  }, [open, items]);

  return (
    <div
      ref={rootRef}
      id="mobile-menu"
      inert={!open}
      aria-hidden={!open}
      className="fixed inset-0 z-40 min-[900px]:hidden"
    >
      {LAYER_CLASSES.map((layerClass, index) => (
        <div
          key={layerClass}
          ref={(element) => {
            layerRefs.current[index] = element;
          }}
          className={layerClass}
          aria-hidden={index < 2 || undefined}
        >
          {index === 2 && (
            <ul className="flex flex-col gap-4">
              {items.map((item, itemIndex) => (
                <li key={item.href} className="overflow-hidden">
                  <a
                    ref={(element) => {
                      linkRefs.current[itemIndex] = element;
                    }}
                    href={item.href}
                    onClick={(event) => {
                      event.preventDefault();
                      onNavigate(item.href);
                      onClose();
                    }}
                    className="block font-display text-[2.5rem] leading-[1.15] tracking-[-0.02em] text-suiting will-change-transform"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default StaggeredMenu;
