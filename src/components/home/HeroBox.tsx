import Image from "next/image";
import type { CSSProperties, Ref } from "react";

import { fabricTextureStyle } from "@/components/fabrics/FabricTexture";
import { getFabric } from "@/lib/data";
import { cn } from "@/lib/cn";

/**
 * The hero's gift box, built from CSS 3D planes: a suiting-board base with
 * four walls, a lid with a skirt, a red ribbon cross and bow, two sheets of
 * tissue and a folded length of navy twill — plus the panel of that twill
 * that stands up out of the box as it unfolds.
 *
 * It holds no state. Every moving part reads a 0 → 1 progress variable from
 * an ancestor (see the "Hero unboxing" block in globals.css):
 *
 *   --ribbon    ribbon bands slide off, the bow drops away
 *   --lid       lid lifts and tips back
 *   --lid-away  lid drifts out of frame
 *   --tissue    tissue sheets fold outward over the walls
 *   --unfold    the twill panel grows out of the box
 *   --tilt      the box turns to face the viewer more
 *
 * GSAP scrubs those variables on desktop; the mobile frames set them inline
 * with heroStageStyle(); no-JS and reduced-motion get the open end state.
 */

/** Inline style that may carry custom properties. */
export type CSSVars = CSSProperties & { [key: `--${string}`]: string | number };

export interface HeroStage {
  readonly ribbon?: number;
  readonly lid?: number;
  readonly lidAway?: number;
  readonly tissue?: number;
  readonly unfold?: number;
  readonly tilt?: number;
}

/**
 * Inline variables for a frozen stage of the unboxing. A frozen box never
 * hands its cloth over to the hero's flat panel, so --panel is pinned at 0.
 */
export function heroStageStyle(stage: HeroStage): CSSVars {
  return {
    "--ribbon": stage.ribbon ?? 0,
    "--lid": stage.lid ?? 0,
    "--lid-away": stage.lidAway ?? 0,
    "--tissue": stage.tissue ?? 0,
    "--unfold": stage.unfold ?? 0,
    "--tilt": stage.tilt ?? 0,
    "--panel": 0,
  };
}

const twill = getFabric("navy-twill");
/** The cloth in the box is the navy twill from the swatch book. */
export const heroTwillStyle: CSSProperties =
  twill === undefined ? {} : fabricTextureStyle(twill);

interface HeroBoxProps {
  readonly className?: string;
  readonly style?: CSSVars;
  /** The standing twill panel — the hero measures it to hand over to the 2D panel. */
  readonly unfoldRef?: Ref<HTMLDivElement>;
  /** Load the lid label eagerly (the desktop box is above the fold). */
  readonly priority?: boolean;
}

export function HeroBox({ className, style, unfoldRef, priority }: HeroBoxProps) {
  return (
    <div className={cn("hb", className)} style={style} aria-hidden="true">
      <div className="hb-rig">
        <div className="hb-face hb-floor" />
        <div className="hb-liner" />
        <div className="hb-bundle" style={heroTwillStyle} />
        <div
          ref={unfoldRef}
          className="hb-unfold"
          style={heroTwillStyle}
        />
        <div className="hb-tissue hb-tissue-l" />
        <div className="hb-tissue hb-tissue-r" />

        <div className="hb-face hb-wall hb-wall-back" />
        <div className="hb-face hb-wall hb-wall-left" />
        <div className="hb-face hb-wall hb-wall-right" />
        <div className="hb-face hb-wall hb-wall-front" />

        <div className="hb-lid">
          <div className="hb-face hb-lid-face hb-lid-top" />
          <div className="hb-face hb-lid-face hb-skirt hb-skirt-back">
            <span className="hb-skirt-band hb-skirt-band-x" />
          </div>
          <div className="hb-face hb-lid-face hb-skirt hb-skirt-left">
            <span className="hb-skirt-band hb-skirt-band-y" />
          </div>
          <div className="hb-face hb-lid-face hb-skirt hb-skirt-right">
            <span className="hb-skirt-band hb-skirt-band-y" />
          </div>
          <div className="hb-face hb-lid-face hb-skirt hb-skirt-front">
            <span className="hb-skirt-band hb-skirt-band-x" />
          </div>

          <div className="hb-label">
            <Image
              src="/brand/kushagra-logo.png"
              alt=""
              width={816}
              height={564}
              sizes="160px"
              priority={priority}
              className="h-auto w-[68%]"
            />
          </div>
          <div className="hb-ribbon hb-ribbon-a" />
          <div className="hb-ribbon hb-ribbon-b" />
          <div className="hb-bow">
            <span className="hb-bow-loop hb-bow-loop-l" />
            <span className="hb-bow-loop hb-bow-loop-r" />
            <span className="hb-bow-knot" />
          </div>
        </div>
      </div>
    </div>
  );
}
