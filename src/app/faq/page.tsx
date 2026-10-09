import type { Metadata } from "next";

import { InfoBlock, InfoPage } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Unstitched fabric, swaps, lengths for taller men and corporate orders — what givers ask before they send a Kushagra box.",
  alternates: { canonical: "/faq" },
};

const QUESTIONS: readonly { readonly q: string; readonly a: string }[] = [
  {
    q: "Do you stitch the clothes or send unstitched fabric?",
    a: "We send premium unstitched lengths in a gift box. Every man has a tailor who knows his posture, his collar and how he likes the fit. You give him the cloth; he gets it made his way.",
  },
  {
    q: "Can he exchange the fabric for another shade?",
    a: "Yes. Every box has a care card with our WhatsApp number. If a length is uncut and unwashed, we arrange a doorstep exchange at no charge.",
  },
  {
    q: "Is the length enough for a taller or broader man?",
    a: "Shirt lengths are 1.6 m, enough for a full-sleeve shirt up to a 46-inch chest. Suit lengths are 3.25 m and bandhgala lengths 2.5 m.",
  },
  {
    q: "How do corporate or bulk orders work?",
    a: "From 10 boxes up we coordinate on WhatsApp, print your logo on the gift cards and dispatch to as many addresses across India as you need.",
  },
];

export default function FaqPage() {
  return (
    <InfoPage
      href="/faq"
      title="Questions givers ask"
      intro="Everything worth knowing before you send him a length of cloth."
    >
      {QUESTIONS.map((item) => (
        <InfoBlock key={item.q} heading={item.q}>
          <p>{item.a}</p>
        </InfoBlock>
      ))}
    </InfoPage>
  );
}
