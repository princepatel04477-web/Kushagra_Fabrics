import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface SectionShellProps {
  /** Anchor id, and the prefix for the heading's id. */
  readonly id: string;
  readonly heading: string;
  /** 1 when this section is the page itself (its own route), else 2. */
  readonly headingLevel?: 1 | 2;
  /** One real line under the heading. */
  readonly intro?: string;
  readonly children?: ReactNode;
  readonly className?: string;
  /** Override the default left, slightly-off-centre heading column. */
  readonly headingClassName?: string;
  readonly contentClassName?: string;
}

/**
 * The one section wrapper.
 *
 * Heading and intro sit in the first seven columns of the 12-column shell —
 * left, and a little off centre, like cloth folded into a box. Content takes
 * the full grid underneath.
 *
 * On its own route a section is the page, so it takes the page's h1.
 */
export function SectionShell({
  id,
  heading,
  headingLevel = 2,
  intro,
  children,
  className,
  headingClassName,
  contentClassName,
}: SectionShellProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(
        headingLevel === 1 ? "page-top" : "section-pad",
        className,
      )}
    >
      <div className="grid-shell">
        <div
          className={cn(
            "col-span-12 flex flex-col gap-6 lg:col-span-7",
            headingClassName,
          )}
        >
          <Heading id={`${id}-heading`} className="text-suiting">
            {heading}
          </Heading>
          {intro !== undefined ? (
            <p className="text-[1.0625rem] text-chalk">{intro}</p>
          ) : null}
        </div>

        {children !== undefined ? (
          <div className={cn("col-span-12 mt-14", contentClassName)}>
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
