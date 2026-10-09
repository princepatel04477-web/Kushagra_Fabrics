import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SectionShellProps {
  id: string;
  heading: string;
  intro?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Reusable section wrapper: 12-column shell, heading and intro set left
 * and slightly off-centre, like folded cloth in a box. Children occupy a
 * wide left-anchored block beneath.
 */
export function SectionShell({
  id,
  heading,
  intro,
  children,
  className,
}: SectionShellProps) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("shell section-pad scroll-mt-28", className)}
    >
      <div className="grid-12">
        <div className="col-span-12 lg:col-start-2 lg:col-span-7">
          <h2 id={headingId}>{heading}</h2>
          {intro ? <p className="mt-6 text-chalk">{intro}</p> : null}
        </div>
        {children ? (
          <div className="col-span-12 mt-14 lg:col-start-2 lg:col-span-10 lg:mt-20">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
