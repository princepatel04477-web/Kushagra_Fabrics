import Image from "next/image";
import { SectionShell } from "@/components/sections/SectionShell";
import { Hero } from "@/components/sections/Hero";

export default function HomePage() {
  return (
    <main id="main">
      <Hero />

      <SectionShell
        id="occasions"
        heading="Pick the occasion"
        intro="Rakhi, weddings, Diwali, anniversaries — every box starts with the reason you are gifting, and the date it has to land by."
      >
        <p className="text-chalk">
          Five occasions, one promise: fabric he will cut into something he
          wears for years, not something that sits wrapped in a cupboard.
        </p>
      </SectionShell>

      <SectionShell
        id="fabrics"
        heading="Feel the fabric"
        intro="Giza poplins, wet-spun linens, super 130s worsteds — premium unstitched cloth, described the way his tailor would."
      >
        <p className="text-chalk">
          Every swatch page lists the weave, the count and the hand feel, so
          you can gift a fabric you have never touched with total confidence.
        </p>
      </SectionShell>

      <SectionShell
        id="boxes"
        heading="Choose his box"
        intro="Three tiers, folded like cloth should be. You pick everything; he opens a box that already knows his size of occasion."
      >
        <p className="text-chalk">
          From a single shirting cut to a full measure with a suit length,
          each tier sets how many fabrics the box holds and how long your
          note can be.
        </p>
      </SectionShell>

      <SectionShell
        id="builder"
        heading="Build the gift"
        intro="Occasion, box, fabrics, note — the whole gift assembled in under two minutes, with the price honest from the first click."
      >
        <p className="text-chalk">
          The builder keeps your bag between visits, so a gift started on the
          commute can be finished on the sofa.
        </p>
      </SectionShell>

      <SectionShell
        id="how"
        heading="How it works"
        intro="You select the fabric. His tailor stitches it. He stands out. Three steps, no fittings, no returns theatre."
      >
        <p className="text-chalk">
          We ship unstitched on purpose: the fit comes from the tailor he
          already trusts, and the credit for the shirt goes to you.
        </p>
      </SectionShell>

      <SectionShell
        id="made"
        heading="What he made of it"
        intro="Real boxes, real tailors, real first reactions — the shirts, suits and half-believed thank-you calls your gifts became."
      >
        <p className="text-chalk">
          Givers send us the finished garment. We photograph it beside the
          box it came in, with his note and yours.
        </p>
      </SectionShell>

      <SectionShell
        id="corporate"
        heading="Gifting for teams"
        intro="Bulk boxes for HR and client teams: one invoice, notes addressed by you, fabric choices curated to a dress code."
      >
        <p className="text-chalk">
          From twenty boxes to two hundred, with a single point of contact
          and delivery split across every office on your list.
        </p>
      </SectionShell>

      <footer className="shell pt-10 pb-24">
        <div className="flex flex-col items-center gap-8 text-center">
          <Image
            src="/brand/kushagra-logo.png"
            alt="Kushagra"
            width={1408}
            height={768}
            sizes="180px"
            className="h-14 w-auto"
          />
          <div className="stitch-rule w-48" aria-hidden="true" />
          <p className="text-sm text-chalk">
            Select • Stitch • Stand out — premium unstitched shirting and
            suiting fabric gift boxes for men.
          </p>
          <p className="text-sm text-chalk">
            © {new Date().getFullYear()} Kushagra Fabrics, Surat
          </p>
        </div>
      </footer>
    </main>
  );
}
