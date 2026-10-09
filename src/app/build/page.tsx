import type { Metadata } from "next";
import { Suspense } from "react";

import { Builder } from "@/components/builder/Builder";
import { BuildParams } from "@/components/builder/BuildParams";

export const metadata: Metadata = {
  title: "Build a gift box",
  description:
    "Choose the box, pick the shirting and suiting, and write the card. We wrap it, tie the ribbon and deliver it to his door.",
  alternates: { canonical: "/build" },
};

export default function BuildPage() {
  return (
    <main id="main" tabIndex={-1}>
      <Suspense fallback={null}>
        <BuildParams />
      </Suspense>
      <Builder headingLevel={1} />
    </main>
  );
}
