import type { Metadata } from "next";

import { NavLink } from "@/components/chrome/NavLink";
import { InfoBlock, InfoPage, infoLinkClass } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "Returns and exchanges",
  description:
    "Uncut, unwashed fabric can be returned or exchanged within 7 days, with doorstep pickup — including swaps the recipient asks for himself.",
  alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
  return (
    <InfoPage
      href="/returns"
      title="Returns and exchanges"
      intro="Seven days, uncut and unwashed, picked up from the door."
    >
      <p className="text-chalk">
        We want the giver and the man who opens the box to both love the
        cloth. If a length is uncut, unwashed and as it arrived, we&apos;ll
        return or exchange it within 7 days of delivery.
      </p>

      <InfoBlock heading="Swaps he asks for">
        <p>
          If he&apos;d rather a different shade or weave, he can start a swap
          himself from the number on his care card. We pick up the length and
          send the new one.
        </p>
      </InfoBlock>

      <InfoBlock heading="How to start one">
        <p>
          Message us with your order number or phone number from the{" "}
          <NavLink href="/contact" className={infoLinkClass}>
            contact page
          </NavLink>
          . We book the courier pickup.
        </p>
      </InfoBlock>
    </InfoPage>
  );
}
