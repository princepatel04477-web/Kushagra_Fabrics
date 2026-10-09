import type { Metadata } from "next";

import { InfoBlock, InfoPage } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Kushagra collects to pack, print and deliver your gift, and who it is shared with.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <InfoPage
      href="/privacy"
      title="Privacy"
      intro="We collect only what it takes to pack the box, print your note and get it to his door."
    >
      <InfoBlock heading="What we use it for">
        <p>
          Your name, phone number, address and the words on your gift card are
          used to prepare and deliver your order, and nothing else.
        </p>
      </InfoBlock>

      <InfoBlock heading="Who sees it">
        <p>
          We never sell or rent your details. The only people we share them
          with are our courier partners, and only what they need to deliver
          the box and send you tracking updates.
        </p>
      </InfoBlock>

      <InfoBlock heading="Your bag">
        <p>
          The boxes in your bag are saved in this browser only, so they are
          still there when you come back. Clearing your browser data removes
          them.
        </p>
      </InfoBlock>
    </InfoPage>
  );
}
