import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/how/HowItWorks";
import { MadeGallery } from "@/components/made/MadeGallery";
import { Occasions } from "@/components/occasions/Occasions";

export default function HomePage() {
  return (
    <main id="main" tabIndex={-1}>
      <Hero />

      <Occasions />

      <HowItWorks />

      <MadeGallery />
    </main>
  );
}
