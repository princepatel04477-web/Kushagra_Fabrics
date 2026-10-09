import { Hero } from "@/components/home/Hero";
import { TheBoxes } from "@/components/home/TheBoxes";
import { TheCloth } from "@/components/home/TheCloth";
import { HowItWorks } from "@/components/how/HowItWorks";
import { MadeGallery } from "@/components/made/MadeGallery";
import { Occasions } from "@/components/occasions/Occasions";

export default function HomePage() {
  return (
    <main id="main" tabIndex={-1}>
      <Hero />

      <TheCloth />

      <HowItWorks />

      <MadeGallery />

      <TheBoxes />

      <Occasions />
    </main>
  );
}
