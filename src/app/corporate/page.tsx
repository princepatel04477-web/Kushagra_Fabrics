import type { Metadata } from "next";

import { Corporate } from "@/components/corporate/Corporate";

export const metadata: Metadata = {
  title: "Corporate fabric gifting",
  description:
    "Diwali boxes for 50 people or wedding favours for 500. Your logo on the card, mixed fabrics in one order, delivery to multiple addresses.",
  alternates: { canonical: "/corporate" },
};

export default function CorporatePage() {
  return (
    <main id="main" tabIndex={-1}>
      <Corporate headingLevel={1} />
    </main>
  );
}
