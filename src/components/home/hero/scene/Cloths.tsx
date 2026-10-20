"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group, Texture } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

import { heroPose } from "@/lib/heroTimeline";

import type { HeroProgress } from "../progress";
import { INNER } from "./geometry";
import type { HeroMaterials } from "./materials";
import { WEAVE_TILE, noteCardTexture, type WeaveKind } from "./textures";

/**
 * The three lengths in the box — Oxford white at the back, Sky end-on-end in
 * the middle, Charcoal herringbone in front, the order of hero-box.jpg — and
 * the giver's note card lying on the herringbone.
 *
 * A folded length is drawn as two soft slabs, the upper one a little shorter
 * and set back, so the edge shows the layers of the fold. At the reveal the
 * lengths lift a few millimetres and part, back one first.
 */

const SLAB = { w: 3.16, d: 0.74, t: 0.09, r: 0.04 } as const;

interface Length {
  readonly kind: WeaveKind;
  readonly z: number;
}

const LENGTHS: readonly Length[] = [
  { kind: "oxford", z: -0.8 },
  { kind: "endonend", z: 0 },
  { kind: "herringbone", z: 0.8 },
];

/** Where the cloth's top surface sits, for the tissue and the card. */
export const CLOTH_SURFACE = INNER.floor + SLAB.t * 2;

const CARD = { w: 0.95, d: 0.64 } as const;
const CARD_LINES = ["Have it cut", "the way you like it."] as const;

interface ClothsProps {
  readonly progress: HeroProgress;
  readonly materials: HeroMaterials;
}

export function Cloths({ progress, materials }: ClothsProps) {
  const groupRefs = useRef<Array<Group | null>>([]);
  const cardRef = useRef<Group | null>(null);
  const invalidate = useThree((state) => state.invalidate);
  const [cardFace, setCardFace] = useState<Texture | null>(null);

  const geometry = useMemo(
    () => ({
      under: new RoundedBoxGeometry(SLAB.w, SLAB.t, SLAB.d, 4, SLAB.r),
      over: new RoundedBoxGeometry(SLAB.w - 0.1, SLAB.t * 0.95, SLAB.d - 0.04, 4, SLAB.r),
      card: new RoundedBoxGeometry(CARD.w, 0.008, CARD.d, 2, 0.003),
    }),
    [],
  );

  // One tile of weave spans WEAVE_TILE units; the slab's top face spans its
  // full size in UV space, so repeat by its size.
  useEffect(() => {
    for (const kind of ["oxford", "endonend", "herringbone"] as const) {
      const material = materials.cloth[kind];
      for (const texture of [material.map, material.normalMap]) {
        texture?.repeat.set(SLAB.w / WEAVE_TILE, SLAB.d / WEAVE_TILE);
      }
    }
  }, [materials]);

  // The card is drawn in the display face once it has loaded.
  useEffect(() => {
    let cancelled = false;
    let texture: Texture | null = null;
    const family =
      getComputedStyle(document.documentElement).getPropertyValue("--font-bodoni-moda").trim() ||
      "serif";
    void document.fonts.load(`400 76px ${family}`).then(() => {
      if (cancelled) return;
      texture = noteCardTexture(family, CARD_LINES);
      setCardFace(texture);
      invalidate();
    });
    return () => {
      cancelled = true;
      texture?.dispose();
    };
  }, [invalidate]);

  useEffect(
    () => () => {
      geometry.under.dispose();
      geometry.over.dispose();
      geometry.card.dispose();
    },
    [geometry],
  );

  useFrame(() => {
    const { reveal, card } = heroPose(progress.get());

    LENGTHS.forEach((length, index) => {
      const group = groupRefs.current[index];
      if (group === undefined || group === null) return;
      // The back length moves first; each lifts and leans apart a little.
      const own = Math.min(1, Math.max(0, reveal * 1.35 - (2 - index) * 0.12));
      group.position.set(0, own * (0.03 + 0.012 * (2 - index)), length.z + (index - 1) * 0.05 * own);
      group.rotation.set(0, (index - 1) * -0.025 * own, (index - 1) * 0.01 * own);
    });

    const note = cardRef.current;
    if (note !== null) {
      const lift = Math.min(1, reveal * 1.35);
      note.position.set(0.95 - 0.5 * card, CLOTH_SURFACE + 0.03 * lift + 0.006, 0.62 + 0.16 * card);
      note.rotation.set(0, 0.42 - 0.3 * card, 0);
    }
  });

  const underY = INNER.floor + SLAB.t / 2;
  const overY = INNER.floor + SLAB.t + (SLAB.t * 0.95) / 2;

  return (
    <group>
      {LENGTHS.map((length, index) => (
        <group
          key={length.kind}
          ref={(node) => {
            groupRefs.current[index] = node;
          }}
          position={[0, 0, length.z]}
        >
          <mesh
            geometry={geometry.under}
            material={materials.cloth[length.kind]}
            position={[0, underY, 0]}
            castShadow
            receiveShadow
          />
          <mesh
            geometry={geometry.over}
            material={materials.cloth[length.kind]}
            position={[-0.035, overY, -0.01]}
            castShadow
            receiveShadow
          />
        </group>
      ))}

      <group ref={cardRef} position={[0.95, CLOTH_SURFACE + 0.006, 0.62]} rotation={[0, 0.42, 0]}>
        <mesh geometry={geometry.card} material={materials.paper} castShadow receiveShadow />
        {cardFace !== null ? (
          <mesh position={[0, 0.0045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[CARD.w - 0.02, CARD.d - 0.02]} />
            <meshStandardMaterial map={cardFace} roughness={0.9} polygonOffset polygonOffsetFactor={-1} />
          </mesh>
        ) : null}
      </group>
    </group>
  );
}
