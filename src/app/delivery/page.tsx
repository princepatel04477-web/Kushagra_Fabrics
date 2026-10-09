import type { Metadata } from "next";

import { InfoBlock, InfoPage } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "Delivery",
  description:
    "Every Kushagra box is folded by hand, ribboned and sleeved for transit, then delivered across India with tracking on WhatsApp.",
  alternates: { canonical: "/delivery" },
};

export default function DeliveryPage() {
  return (
    <InfoPage
      href="/delivery"
      title="Delivery and packing"
      intro="Packed by hand in Surat and delivered across India."
    >
      <p className="text-chalk">
        Every box is folded by hand, tied with our ribbon and packed inside a
        plain transit sleeve, so the gift box itself arrives clean and
        unmarked.
      </p>

      <InfoBlock heading="How long it takes">
        <p>
          Metro cities: 2–4 working days. Rest of India: 3–6 working days.
          Need it sooner? Ask on WhatsApp and we&apos;ll tell you what&apos;s
          possible for your pin code.
        </p>
      </InfoBlock>

      <InfoBlock heading="Tracking">
        <p>
          The courier link reaches you on WhatsApp and SMS the moment your box
          leaves us.
        </p>
      </InfoBlock>

      <InfoBlock heading="Wrapping">
        <p>Gift wrapping is free on every box.</p>
      </InfoBlock>
    </InfoPage>
  );
}
