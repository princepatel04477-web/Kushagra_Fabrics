import type { ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";

import { NavLink } from "@/components/chrome/NavLink";
import { cn } from "@/lib/cn";

/** Every help and company page, in the order the side list shows them. */
export const INFO_PAGES = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/delivery", label: "Delivery" },
  { href: "/care", label: "Care guide" },
  { href: "/returns", label: "Returns" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export type InfoHref = (typeof INFO_PAGES)[number]["href"];

interface InfoPageProps {
  /** Which page this is — marked current in the side list. */
  readonly href: InfoHref;
  readonly title: string;
  readonly intro: string;
  readonly image?: { readonly src: StaticImageData; readonly alt: string };
  readonly children: ReactNode;
}

/**
 * Shell for the plain-reading pages: the heading in the first seven columns,
 * the text under it in the same seven, and the list of the other help pages
 * in columns 10–12. Left and off-centre, like the rest of the site.
 */
export function InfoPage({
  href,
  title,
  intro,
  image,
  children,
}: InfoPageProps) {
  return (
    <main id="main" tabIndex={-1}>
      <section aria-labelledby="info-heading" className="page-top">
        <div className="grid-shell">
          <div className="col-span-12 flex flex-col gap-6 lg:col-span-7">
            <h1 id="info-heading" className="text-suiting">
              {title}
            </h1>
            <p className="text-[1.0625rem] text-chalk">{intro}</p>
            {image !== undefined ? (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-m border border-line bg-paper">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1320px) 730px, (min-width: 1024px) 58vw, 100vw"
                  placeholder="blur"
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>

          <div className="col-span-12 mt-14 flex flex-col gap-10 lg:col-span-7">
            {children}
          </div>

          <nav
            aria-label="Help and company"
            className="col-span-12 mt-16 lg:col-span-3 lg:col-start-10 lg:mt-14"
          >
            <ul className="flex flex-col border-t border-line">
              {INFO_PAGES.map((page) => {
                const current = page.href === href;
                return (
                  <li key={page.href} className="border-b border-line">
                    <NavLink
                      href={page.href}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "flex min-h-[48px] items-center text-[0.9375rem] transition-colors duration-300",
                        current
                          ? "font-semibold text-suiting"
                          : "text-chalk hover:text-suiting",
                      )}
                    >
                      {page.label}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </section>
    </main>
  );
}

interface InfoBlockProps {
  readonly heading: string;
  readonly children: ReactNode;
}

/** One topic on an info page: a short heading over a few paragraphs. */
export function InfoBlock({ heading, children }: InfoBlockProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-line pt-8 text-chalk">
      <h2 className="text-[1.75rem] leading-[1.08] text-suiting">{heading}</h2>
      {children}
    </div>
  );
}

/** An inline link inside info copy. */
export const infoLinkClass =
  "text-suiting underline decoration-line underline-offset-4 transition-colors duration-300 hover:decoration-suiting";
