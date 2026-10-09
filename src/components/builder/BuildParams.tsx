"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { getBox, getFabric, getOccasion } from "@/lib/data";
import { useGiftStore } from "@/store/gift";

/**
 * Lets a link land on /build already filled in:
 * /build?box=suit-box&fabric=navy-twill&fabric=oxford-white&occasion=wedding
 *
 * Unknown ids are ignored. The box is applied before the fabrics so the slot
 * rules in the store decide what fits. Runs once per distinct query.
 */
export function BuildParams() {
  const params = useSearchParams();
  const query = params.toString();

  useEffect(() => {
    if (query === "") return;
    const search = new URLSearchParams(query);
    const { setBox, addFabric, setOccasion } = useGiftStore.getState();

    const box = search.get("box");
    if (getBox(box) !== undefined) setBox(box);

    for (const fabric of search.getAll("fabric")) {
      if (getFabric(fabric) !== undefined) addFabric(fabric);
    }

    const occasion = search.get("occasion");
    if (getOccasion(occasion) !== undefined) setOccasion(occasion);
  }, [query]);

  return null;
}
