import type { Metadata } from "next";

import { BoxTiers } from "@/components/boxes/BoxTiers";

export const metadata: Metadata = {
  title: "Gift boxes",
  description:
    "The Shirt Box, the Suit Box and the Groom's Trunk — premium unstitched fabric, wrapped, ribboned and ready to hand over.",
  alternates: { canonical: "/boxes" },
};

export default function BoxesPage() {
  return (
    <main id="main" tabIndex={-1}>
      <BoxTiers headingLevel={1} />
    </main>
  );
}
