import { NavLink } from "@/components/chrome/NavLink";

/**
 * Home hero. Static for now — the scroll-driven unboxing (Phase 2) slots in
 * here and is GSAP-owned when it lands.
 */
export function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="grid-shell pb-[clamp(80px,10vw,140px)] pt-[clamp(150px,20vw,240px)]"
    >
      <div className="col-span-12 flex flex-col gap-8 lg:col-span-9">
        <h1 id="hero-heading" className="text-suiting">
          Give him the cloth.
        </h1>
        <p className="max-w-[58ch] text-[1.125rem] text-chalk">
          Kushagra boxes premium unstitched shirting and suiting and sends it
          to his door. You choose the fabric, he takes it to his own tailor,
          and he ends up in a shirt nobody else is wearing.
        </p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <NavLink
            href="/build"
            className="inline-flex h-12 items-center rounded-pill bg-red-deep px-7 text-[1rem] font-semibold text-white transition-opacity duration-300 hover:opacity-90"
          >
            Build a gift
          </NavLink>
          <NavLink
            href="/fabrics"
            className="text-[1rem] font-medium text-suiting underline decoration-line decoration-1 underline-offset-[6px] transition-colors duration-300 hover:decoration-suiting"
          >
            See the fabrics
          </NavLink>
        </div>
        <p className="text-[0.9375rem] text-chalk">
          Select • Stitch • Stand Out
        </p>
      </div>
    </section>
  );
}
