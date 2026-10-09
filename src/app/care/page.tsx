import type { Metadata } from "next";

import { InfoBlock, InfoPage } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "Care guide",
  description:
    "How to wash, press and look after cotton shirting, wool suiting, linen and cotton velvet — notes for him and his tailor.",
  alternates: { canonical: "/care" },
};

export default function CarePage() {
  return (
    <InfoPage
      href="/care"
      title="Care guide"
      intro="Notes for him and for his tailor. Every box carries a printed card with the same."
    >
      <p className="text-chalk">
        The tailor card in each box lists the mill composition, the yarn count
        or weight, and the length, so the cutting starts from facts.
      </p>

      <InfoBlock heading="Cotton shirting">
        <p>
          Give it a gentle cold pre-wash before cutting; cotton relaxes by 1–2%.
          After that, machine wash warm with like colours and iron while
          slightly damp.
        </p>
      </InfoBlock>

      <InfoBlock heading="Wool blend suiting">
        <p>
          Dry clean only. Steam rather than press, and keep direct high heat
          off the cloth to protect the wool and its drape.
        </p>
      </InfoBlock>

      <InfoBlock heading="Linen">
        <p>
          Linen softens with every wash. Dry clean or hand wash gently, never
          wring, dry in shade and iron while damp for a crisp finish — or let
          it keep its easy creases.
        </p>
      </InfoBlock>

      <InfoBlock heading="Cotton velvet">
        <p>
          Professional dry clean only. Steam from the reverse to keep the pile
          standing, and never put an iron directly on it.
        </p>
      </InfoBlock>
    </InfoPage>
  );
}
