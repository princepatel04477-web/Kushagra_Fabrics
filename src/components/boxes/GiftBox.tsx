import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface GiftBoxProps {
  /**
   * Illustration size. sm: 132×110 (box cards, bag lines).
   * md: 240×200 (the builder preview). Default md.
   */
  readonly size?: "sm" | "md";
  /**
   * open: lid tilted back, the interior visible — children render as folded
   * cloth layers inside the opening. closed: lid shut with a red bow.
   * Default closed.
   */
  readonly stage?: "open" | "closed";
  readonly className?: string;
  /** Folded-cloth layers, rendered inside the opening when stage is "open". */
  readonly children?: ReactNode;
}

const SIZE_CLASS: Record<"sm" | "md", string> = {
  sm: "max-w-[132px]",
  md: "max-w-[240px]",
};

/**
 * The Kushagra gift box, drawn in SVG: suiting-board box, red grosgrain
 * ribbon, and — when open — a dark interior where the folded cloth layers
 * (passed as children) sit. Viewed slightly from above.
 */
export function GiftBox({
  size = "md",
  stage = "closed",
  className,
  children,
}: GiftBoxProps) {
  return (
    <div
      role="img"
      aria-label={
        stage === "open"
          ? "Open Kushagra gift box"
          : "Kushagra gift box, ribboned"
      }
      className={cn(
        "relative aspect-[6/5] w-full",
        SIZE_CLASS[size],
        className,
      )}
    >
      <svg
        viewBox="0 0 240 200"
        aria-hidden="true"
        focusable="false"
        className="absolute inset-0 h-full w-full"
      >
        {stage === "open" ? (
          <>
            {/* Lid, tilted open behind the box. */}
            <polygon points="56,68 184,68 168,24 72,24" fill="#1B2433" />
            <polygon points="110,68 130,68 126,24 114,24" fill="#E63339" />
            {/* Interior, seen from slightly above. */}
            <rect x="50" y="64" width="140" height="30" fill="#0E1420" />
          </>
        ) : (
          <>
            {/* Closed lid with an overhang, and the bow. */}
            <rect x="42" y="56" width="156" height="22" rx="4" fill="#1B2433" />
            <rect x="110" y="56" width="20" height="22" fill="#E63339" />
            <ellipse
              cx="108"
              cy="50"
              rx="12"
              ry="8"
              fill="#E63339"
              transform="rotate(-18 108 50)"
            />
            <ellipse
              cx="132"
              cy="50"
              rx="12"
              ry="8"
              fill="#E63339"
              transform="rotate(18 132 50)"
            />
            <circle cx="120" cy="53" r="5" fill="#B7252B" />
          </>
        )}
        {/* Front face, tapering slightly toward the base. */}
        <polygon points="46,88 194,88 186,180 54,180" fill="#1B2433" />
        {/* Ribbon down the front. */}
        <polygon points="108,88 132,88 129,180 111,180" fill="#E63339" />
        {/* Rim shadow under the opening / lid. */}
        <rect x="46" y="88" width="148" height="3" fill="#0E1420" />
      </svg>
      {stage === "open" && children !== undefined ? (
        <div className="pointer-events-none absolute left-[21%] right-[21%] top-[32%] flex h-[12%] flex-col justify-center">
          {children}
        </div>
      ) : null}
    </div>
  );
}
