import type { Metadata } from "next";

import { FabricGrid } from "@/components/fabrics/FabricGrid";

export const metadata: Metadata = {
  title: "Shirting and suiting fabrics",
  description:
    "Eight unstitched cloths we'd wear ourselves — Oxford, Bengal stripe, linen, twill, herringbone, velvet and more — with count, weight and length for his tailor.",
  alternates: { canonical: "/fabrics" },
};

export default function FabricsPage() {
  return (
    <main id="main" tabIndex={-1}>
      <FabricGrid headingLevel={1} />
    </main>
  );
}
