import type { Metadata } from "next";

import { InfoBlock, InfoPage } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "The terms that apply to every Kushagra order: prices, confirmation, fabric lengths and returns.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <InfoPage
      href="/terms"
      title="Terms"
      intro="Plain terms that apply to every order."
    >
      <InfoBlock heading="Prices">
        <p>
          All prices are in Indian rupees and include applicable taxes.
          Delivery is calculated at checkout.
        </p>
      </InfoBlock>

      <InfoBlock heading="Orders">
        <p>Orders are confirmed, then packed, once payment is received.</p>
      </InfoBlock>

      <InfoBlock heading="Lengths">
        <p>
          Every length meets or exceeds the measurement quoted on the site and
          on the tailor card.
        </p>
      </InfoBlock>

      <InfoBlock heading="Returns">
        <p>
          Uncut, unwashed lengths can be returned or exchanged within 7 days of
          delivery.
        </p>
      </InfoBlock>
    </InfoPage>
  );
}
