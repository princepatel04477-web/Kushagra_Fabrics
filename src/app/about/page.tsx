import type { Metadata } from "next";

import { NavLink } from "@/components/chrome/NavLink";
import { InfoBlock, InfoPage, infoLinkClass } from "@/components/info/InfoPage";
import herringbone from "@/assets/photos/fabric-herringbone.jpg";

export const metadata: Metadata = {
  title: "About",
  description:
    "Kushagra sends premium unstitched shirting and suiting as a gift. The giver picks the cloth, he takes it to the tailor he trusts, and he stands out.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <InfoPage
      href="/about"
      title="About Kushagra"
      intro="Select • Stitch • Stand Out. A gift for men that fits, because his own tailor cuts it."
      image={{ src: herringbone, alt: "Charcoal herringbone wool, folded" }}
    >
      <p className="text-chalk">
        Kushagra started in Surat, Gujarat, where India&apos;s cloth is woven,
        dyed and traded. We kept seeing men receive the same ready-made shirts
        and boxed garments that never quite fit.
      </p>
      <p className="text-chalk">
        So we changed the gift. The giver chooses honest, high-grade cloth from
        mills we trust. He takes it to the tailor who already knows how he
        stands. And he ends up wearing something nobody else in the room is
        wearing.
      </p>

      <InfoBlock heading="Who we box for">
        <p>
          Sisters on Raksha Bandhan, families at weddings and Diwali, wives on
          anniversaries, and HR teams who want a gift people actually use. See{" "}
          <NavLink href="/corporate" className={infoLinkClass}>
            gifting for teams
          </NavLink>{" "}
          for bulk orders.
        </p>
      </InfoBlock>

      <InfoBlock heading="Talk to us">
        <p>
          Questions, bulk orders or a cloth you can&apos;t find on the site:{" "}
          <NavLink href="/contact" className={infoLinkClass}>
            get in touch
          </NavLink>
          .
        </p>
      </InfoBlock>
    </InfoPage>
  );
}
