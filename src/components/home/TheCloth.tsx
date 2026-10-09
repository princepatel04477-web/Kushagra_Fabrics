/**
 * Home, section two: four of the eight cloths, then a link to all of them.
 */

import { NavLink } from "@/components/chrome/NavLink";
import { FabricCard } from "@/components/fabrics/FabricCard";
import { SectionShell } from "@/components/sections/SectionShell";
import { getFabric, type Fabric } from "@/lib/data";

const FEATURED_IDS = [
  "oxford-white",
  "sky-end-on-end",
  "navy-twill",
  "charcoal-herringbone",
] as const;

export function TheCloth() {
  const featured = FEATURED_IDS.map((id) => getFabric(id)).filter(
    (fabric): fabric is Fabric => fabric !== undefined,
  );

  return (
    <SectionShell
      id="cloth"
      heading="Eight cloths, chosen by hand"
      intro="Shirting for every day, suiting for the days that matter. Start with these four."
    >
      <ul className="grid grid-cols-2 gap-x-4 gap-y-12 min-[900px]:grid-cols-4 min-[900px]:gap-x-6">
        {featured.map((fabric) => (
          <li key={fabric.id}>
            <FabricCard
              fabric={fabric}
              sizes="(min-width: 1320px) 300px, (min-width: 900px) 23vw, 46vw"
            />
          </li>
        ))}
      </ul>
      <NavLink href="/fabrics" className="link-quiet mt-10">
        See all eight
      </NavLink>
    </SectionShell>
  );
}
